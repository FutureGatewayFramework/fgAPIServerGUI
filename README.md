

# Setup the GUI
This project does not use Flask-bootstrap since it uses the third party theme startbootstrap-sb-admin which provides the necessar files.
In order to setup the GUI, please execute the following commands:

# startbootstrap-sb-admin Theme
Theme has been taken from: 

## Theme
This repository provides a copy of the startbootstrap-sb-admin theme, however it can be downloaded by `git clone https://github.com/BlackrockDigital/startbootstrap-sb-admin.git`

```bash
mkdir -p static
[ ! -d startbootstrap-sb-admin ] &&\
  git clone https://github.com/BlackrockDigital/startbootstrap-sb-admin.git
DIRS=(css
      js
      scss
      vendor)
for dir in ${DIRS[@]}; do
    cp -r startbootstrap-sb-admin/$dir static/$dir
done
curl -s https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.0.4/popper.js > static/js/popper.js
curl -s https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.0.4/popper.js.map > static/js/popper.js.map
```

## Execute the GUI

```
virtualenv .venv
. ./.venv/bin/activate
pip install -r requirements.txt
python app.py
```