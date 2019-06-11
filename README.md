

# Bootstrap and jQuery
Although Flask-bootstrap exists, the installation of bootstrap has been handled manually.
Following steps are necessary to setup Bootstrap

1. Download bootstrap and jquery from their download pages and extract files

```bash
curl https://github.com/twbs/bootstrap/releases/download/v3.4.1/bootstrap-3.4.1-dist.zip > bootstrap-3.4.1-dist.zip
unzip -x bootstrap-3.4.1-dist.zip
curl https://code.jquery.com/jquery-3.4.1.min.js > bootstrap-3.4.1-dist/js/bootstrap-3.4.1-dist/js/
```

2. Execute the following command to link bootstrap files into application files:

```bash
mkdir static/js static/fonts static/css &&\
find bootstrap-3.4.1-dist/ -type f |\
     xargs -I{} echo "{} {}" |\
     sed s/bootstrap-3.4.1-dist/static/ |\
     awk '{ print $2" "$1 }' |\
     xargs -I{} echo ln -s "{}"  > do_links &&\
chmod +x do_links &&\
./do_links &&\
rm -f do_links 
```

# Theme
Page theme has been taken from: https://github.com/BlackrockDigital/startbootstrap-sb-admin.git

## Theme
```bash
mkdir -p static
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

## font awesome

```bash
curl  https://use.fontawesome.com/releases/v5.9.0/fontawesome-free-5.9.0-web.zip > fontawesome-free-5.9.0-web.zip
unzip -x fontawesome-free-5.9.0-web.zip 
ln -s  $PWD/fontawesome-free-5.9.0-web/css/all.min.css static/css/all.min.css
```

Setup theme CSS to the Flask static folder

```bash
DIRS=(less
      metadata
      css
      js
      scss
      sprites
      svgs
      webfonts)
for dir in ${DIRS[@]}; do
    mkdir -p static/$dir
    ls -1 fontawesome-free-5.9.0-web/$dir |xargs -I{} ln -sf $PWD/fontawesome-free-5.9.0-web/$dir/{} static/$dir/{}
done
```