from flask import Flask, render_template, send_from_directory

# from core.IB import Expression

app = Flask(__name__,
            static_folder='frontend/build/static',
            template_folder='frontend/build/'
            )


@app.route('/', methods=['GET'])
def run_app():
    return render_template('index.html')


@app.route('/favicon.ico')
def send_favicon():
    return send_from_directory('frontend/build', 'favicon.ico')


@app.route('/service-worker.js')
def send_service_worker():
    return send_from_directory('frontend/build', 'service-worker.js')


@app.route('/', methods=['GET'])
def calculate():
    pass


@app.route('/evaluate/', methods=['GET'])
def evaluate():
    pass


if __name__ == '__main__':
    app.run()
