from models import User
import flask_jwt_extended
from flask import Response, request
from flask_restful import Resource
import json
from datetime import timezone, datetime, timedelta
from flask_jwt_extended import (get_jwt_identity,jwt_required,create_access_token,verify_jwt_in_request)

class AccessTokenEndpoint(Resource):

    def post(self):
        body = request.get_json() or {}
        userName = body["username"]
        passWord = body["password"]
        if(not userName or not passWord):
            return Response(json.dumps({'message': 'Invalid input'}), mimetype="application/json", status=400)
        else:
            user = User.query.filter_by(username = userName).one_or_none()
            if user:
                if user.check_password(passWord):
                    return Response(json.dumps({ 
                        "access_token": flask_jwt_extended.create_access_token(identity = user.id), 
                        "refresh_token": flask_jwt_extended.create_refresh_token(identity = user.id)
                    }), mimetype="application/json", status=200)
                else:
                    return Response(json.dumps({'message': 'Invalid username or password'}), mimetype="application/json", status=401)
            else:
                return Response(json.dumps({'message': 'Invalid username or password'}), mimetype="application/json", status=401)
        # check username and log in credentials. If valid, return tokens


class RefreshTokenEndpoint(Resource):

    @jwt_required()
    def post(self):
        body = request.get_json() or {}
        refresh_token = body.get('refresh_token')
        try:
            decoded_token = flask_jwt_extended.decode_token(refresh_token)
            print(decoded_token)
        except:
            return Response(json.dumps({ 
                    "message": "Invalid refresh_token"
                }), mimetype="application/json", status=400)
        exp_timestamp = decoded_token.get("exp")
        current_timestamp = datetime.timestamp(datetime.now(timezone.utc))
        identity = get_jwt_identity()
        if exp_timestamp < current_timestamp:
            return Response(json.dumps({ 
                    "message": "refresh_token has expired"
                }), mimetype="application/json", status=401)
        else:
            return Response(json.dumps({ 
                    "access_token": create_access_token(identity=identity, fresh=False)
                }), mimetype="application/json", status=200)

        '''
        https://flask-jwt-extended.readthedocs.io/en/latest/refreshing_tokens/
        Hint: To decode the refresh token and see if it expired:
        decoded_token = flask_jwt_extended.decode_token(refresh_token)
        exp_timestamp = decoded_token.get("exp")
        current_timestamp = datetime.timestamp(datetime.now(timezone.utc))
        if exp_timestamp > current_timestamp:
            return Response(json.dumps({ 
                    "message": "refresh_token has expired"
                }), mimetype="application/json", status=401)
        else:
            return Response(json.dumps({ 
                    "access_token": "new access token goes here"
                }), mimetype="application/json", status=200)
        '''
        


def initialize_routes(api):
    api.add_resource(
        AccessTokenEndpoint, 
        '/api/token', '/api/token/'
    )

    api.add_resource(
        RefreshTokenEndpoint, 
        '/api/token/refresh', '/api/token/refresh/'
    )