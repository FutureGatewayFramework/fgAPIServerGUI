import logging
import logging.config
from futuregatewayapis import FutureGatewayAPIs
from flask import Flask
from flask import render_template

# Create root logger object and configure logger
logging.config.fileConfig('logging.conf')


app = Flask(__name__)
fgAPIs = FutureGatewayAPIs(
        'http://localhost/fgapiserver',
        'v1.0',
        'futuregateway',
        'futuregateway')

webapp = {
  'fgapis': fgAPIs,
  'name': 'fgAPIServerGUI',
  'logged': False,
  'configured': False,
  'user': None,
  'apiserver': 'http://localhost/fgapiserver',
  'page': None
}

@app.route('/')
def index():
    logging.debug('Called index')
    webapp['page'] = 'Dashboard'
    return render_template('index.html', webapp=webapp)

if __name__ == '__main__':
    logging.debug('Starting app in stand-alone mode (debug)')
    app.run(debug=True)

