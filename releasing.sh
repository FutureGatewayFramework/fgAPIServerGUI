#!/bin/bash
#
# releasing - script that updates releas on python code files
#
# Author: Riccardo Bruno <riccardo.bruno@ct.infn.it>
#

AUTHOR="Riccardo Bruno"
COPYRIGHT=$(date +"%Y")
LICENSE=Apache
VERSION=v0.0.0
MAINTANIER=$AUTHOR
EMAIL=riccardo.bruno@ct.infn.it
STATUS=devel
UPDATE=$(date +"%Y-%m-%d %H:%M:%S")
VENV2=venv2
VENV3=venv3
PYTHON2=python2
PYTHON3=python3

set_code_headers() {
  TMP=$(mktemp)
  cat >$TMP <<EOF
__author__ = '${AUTHOR}'
__copyright__ = '${COPYRIGHT}'
__license__ = '${LICENSE}'
__version__ = '${VERSION}'
__maintainer__ = '${MAINTANIER}'
__email__ = '${EMAIL}'
__status__ = '${STATUS}'
__update__ = '${UPDATE}'
EOF
  for pyfile in $(/bin/ls -1 *.py *.wsgi tests/*.py); do
      echo "Releasing file: '$pyfile'"
      while read rel_line; do
          rel_item=$(echo $rel_line | awk -F'=' '{ print $1 }' | xargs echo)
          echo "    Processing line item: '$rel_item'"
          CMD=$(echo "sed -i '' s/^${rel_item}.*/\"$rel_line\"/ $pyfile")
          eval $CMD
      done < $TMP
  done
  rm -f $TMP
}

# Call checkstyle
check_style() {
  pycodestyle --ignore=E402 *.py &&\
  pycodestyle tests/*.py
}

# Unittests
unit_tests() {
  TEST_SUITE=(
    fgapiservergui
    fgapiservergui_queries
  )
  cd tests
  export PYTHONPATH=$PYTHONPATH:..:.
  export FGTESTS_STOPATFAIL=1
  for test in ${TEST_SUITE[@]}; do
    python -m unittest --failfast test_${test}
    [ $? -ne 0 ] && return 1 
  done
  cd -
}

# Call checkstyle
check_style() {
  pycodestyle --ignore=E402 *.py &&\
  pycodestyle tests/*.py
}

# Prepare test environment for Python v2
venv2() {
  echo "Preparing virtualenv for Python2"
  $PYTHON2 -m virtualenv $VENV2 &&\
  source ./$VENV2/bin/activate &&\
  pip install -r requirements.txt &&\
  pip install pycodestyle
}

# Prepare test environment for Python v3
venv3() {
  echo "Preparing virtualenv for Python3"
  $PYTHON3 -m venv $VENV3 &&\
  source ./$VENV3/bin/activate &&\
  pip install -r requirements.txt &&\
  pip install pycodestyle
}

# Perform tests for Python v2
tests_py2() {
  echo "Testing for Python v2" &&\
  unit_tests
}

# Perform tests for Python v3
tests_py3() {
  echo "Testing for Python v3" &&\
  unit_tests
}

# Setup Virtual environment and start check style and unittests
check_style_and_tests() {
  PIP=$(which pip)
  [ "$PIP" = "" ] &&\
    echo "Python pip is not present, unable to perform any test" &&\
    return 1

  RES=0
  PYTHON_2=$(which $PYTHON2)
  [ "$PYTHON_2" = "" ] &&\
    echo "which command could not determine python2; trying with 'python'" &&\
    PYTHON_2=$(python --version 2>&1 | awk '{ print substr($2,1,1) }')
  [ "$PYTHON_2" = "2" ] &&\
    echo "python2 is python" &&\
    PYTHON2=python
  if [ "$PYTHON_2" != "" ]; then
    venv2 &&\
    check_style &&\
    tests_py2 &&\
    PY2_DONE=1 ||\
    PY2_DONE=0 
  else
   echo "No python 2 found, skipping tests for this version"
  fi
  [ $((PY2_DONE)) -eq 0 ] &&\
    echo "Releasing chain for python2 failed" &&\
    return 1
  
  PYTHON_3=$(which $PYTHON3)
  [ "$PYTHON_3" = "" ] &&\
    echo "which command could not determine python3; trying with 'python'" &&\
    PYTHON_3=$(python --version 2>&1 | awk '{ print substr($2,1,1) }')
  [ "$PYTHON_3" = "3" ] &&\
    echo "python3 is python" &&\
    PYTHON3=python
  if [ "$PYTHON_3" != "" ]; then
    venv3 &&\
    check_style &&\
    tests_py3 &&\
    PY3_DONE=1 ||\
    PY3_DONE=0 
  else
    echo "No python 3 found, skipping tests for this version"
  fi
  [ $((PY3_DONE)) -eq 0 ] &&\
    echo "Releasing chain for python3 failed" &&\
    return 1

  # No python found at all
  [ $((PY2_DONE)) -eq 0 -a\
    $((PY3_DONE)) -eq 0 ] &&\
    echo "Neither python2 nor python3 found" &&\
    return 1 
  
  return 0
}

#
# Releasing
#
echo "Starting releasing fgAPIServerDaemon ..." &&\
check_style_and_tests &&\
set_code_headers &&\
echo "Done" ||\
echo "Failed"

