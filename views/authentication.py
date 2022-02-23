from flask import (
    request, make_response, render_template, redirect
)
from models import User
import flask_jwt_extended

def logout():
    # hint:  https://dev.to/totally_chase/python-using-jwt-in-cookies-with-a-flask-app-and-restful-api-2p75
    response = make_response(redirect('/login', 302))
    flask_jwt_extended.unset_jwt_cookies(response)
    return response

def login():
    if request.method == 'POST':
        # authenticate user here. If the user sent valid credentials, set the
        # JWT cookies:
        # https://flask-jwt-extended.readthedocs.io/en/3.0.0_release/tokens_in_cookies/
        userName = request.form["username"]
        passWord = request.form["password"]
        error = False
        message = ""
        if(not userName):
            error = True
            message = "Missing Username"
        if(not passWord):
            error = True
            message = "Missing Password"
        user = User.query.filter_by(username = userName).one_or_none()
        if user:
            if user.check_password(passWord):
                access_token = flask_jwt_extended.create_access_token(identity = user.id)
                response = make_response(redirect('/'))
                flask_jwt_extended.set_access_cookies(response, access_token)
                return response
            else:
                error = True
                message = "Wrong password or username!"
        else:
            error = True
            message = "Wrong password or username!"
                
        if(error):
            return render_template(
            'login.html', 
            message=message
        )
    else:
        return render_template(
            'login.html'
        )

def initialize_routes(app):
    app.add_url_rule('/login', 
        view_func=login, methods=['GET', 'POST'])
    app.add_url_rule('/logout', view_func=logout)