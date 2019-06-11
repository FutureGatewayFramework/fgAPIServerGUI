from flask import Flask
from flask import render_template
app = Flask(__name__)

webapp = {
  'name': 'fgAPIServerGUI',
  'logged': False,
  'configured': False,
  'user': None,
  'apiserver': 'http://localhost/fgapiserver',
  'page': None
}

@app.route('/')
def index():
    webapp['page'] = 'Dashboard'
    return render_template('index.html', webapp=webapp)

if __name__ == '__main__':
    app.run(debug=True)

