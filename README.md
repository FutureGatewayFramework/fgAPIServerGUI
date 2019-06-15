# fgAPIServerGUI
This service aims to provide a Dashboard service for the FutureGateway API server [fgapiserver][fgAPIServer] and it is ment to perform administrative operations on users, groups, role, infrastructures, applications, tasks and providing auditing and accounting activities as well.

# Setup the GUI
This project does not use Flask-bootstrap since it uses the third party theme startbootstrap-sb-admin which provides the necessary files for bootstrap.
In order to setup the GUI, please execute the following commands:

## Theme
This repository provides contains a customized copy of the startbootstrap-sb-admin theme, however it can be downloaded by the command `git clone https://github.com/BlackrockDigital/startbootstrap-sb-admin.git` and then copying the js, css and other theme directories inside the `static` directory of the fgAPIServer Flask code. Below an example:
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
# It could be necesary to include also popper.
curl -s https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.0.4/popper.js > static/js/popper.js
curl -s https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.0.4/popper.js.map > static/js/popper.js.map
```

## Execute the GUI
The fgAPIServerGUI operates like any other FutureGateway service ann requires to connect the FutureGateway DB.
To execute the service in standalone mode (development only), use:

```
virtualenv .venv
. ./.venv/bin/activate
pip install -r requirements.txt
python futuregatewaygui.py
```

To execute the server in a production environment, the application needs to be executed via a wgsi engine such as: [apache+mod_wsgi][mod_wsgi] for apache, [Nginx+uWSGI][Nginx+uWSGI] (used by FG Setup), [gunicorn][Gunicorn] and many others.


[gunicorn]: <https://mattgathu.github.io/multiprocessing-logging-in-python/>
[Nginx+uWSGI]: <https://www.digitalocean.com/community/tutorials/how-to-set-up-uwsgi-and-nginx-to-serve-python-apps-on-ubuntu-14-04>
[apache+mod_wsgi]: <https://modwsgi.readthedocs.io/en/develop/user-guides/quick-configuration-guide.html>
[fgapiserver]: <https://github.com/FutureGatewayFramework/fgAPIServer>