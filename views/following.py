from flask import Response, request
from flask_restful import Resource
from models import Following, User, db
import json


def get_path():
    return request.host_url + 'api/posts/'


class FollowingListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user

    def get(self):
        data = Following.query.filter(
            Following.user_id == self.current_user.id).all()
        if not data:
            return Response(json.dumps({'message': 'You haven''t follow anyone yet'}), mimetype="application/json", status=404)
        data = [
            item.to_dict_following() for item in data
        ]
        return Response(json.dumps(data), mimetype="application/json", status=200)

    def post(self):
        body = request.get_json()
        following_id = body.get('user_id')
        user = self.current_user
        if already_following(following_id, user):
            return Response(json.dumps({'message': 'Already add to following'}), mimetype="application/json", status=400)
        data = Following(user.id, following_id)
        db.session.add(data)
        db.session.commit()
        return Response(json.dumps(data.to_dict_following()), mimetype="application/json", status=201)


class FollowingDetailEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user

    def delete(self, id):
        data = Following.query.get(id)
        if not data or data.user_id != self.current_user.id:
            return Response(json.dumps({'message': 'Post does not exist'}), mimetype="application/json", status=404)
        Following.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Following {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)


def already_following(following_id, current_user):
    data = Following.query.filter(Following.user_id == current_user.id).filter(
        Following.following_id == following_id).first()
    if data:
        return True
    return False


def initialize_routes(api):
    api.add_resource(
        FollowingListEndpoint,
        '/api/following',
        '/api/following/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
    api.add_resource(
        FollowingDetailEndpoint,
        '/api/following/<id>',
        '/api/following/<id>/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
