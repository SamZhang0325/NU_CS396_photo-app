from flask import Response
from flask_restful import Resource
from models import LikePost, db
import json
from . import can_view_post, check_int


class PostLikesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    def post(self, post_id):
        if not check_int(post_id):
            return Response(json.dumps({'message': 'Invalid input'}), mimetype="application/json", status=400)
        user = self.current_user
        if not can_view_post(post_id, user):
            return Response(json.dumps({'message': 'Post does not exist'}), mimetype="application/json", status=404)
        if already_like(post_id, user):
            return Response(json.dumps({'message': 'Already add to liked'}), mimetype="application/json", status=400)
        data = LikePost(user.id, post_id)
        db.session.add(data)
        db.session.commit()
        return Response(json.dumps(data.to_dict()), mimetype="application/json", status=201)


class PostLikesDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    def delete(self, post_id, id):
        if not check_int(id) or not check_int(post_id):
            return Response(json.dumps({'message': 'Invalid input'}), mimetype="application/json", status=400)
        data = LikePost.query.get(id)
        if not data or data.user_id != self.current_user.id or data.post_id != int(post_id):
            return Response(json.dumps({'message': 'Post does not exist'}), mimetype="application/json", status=404)
        LikePost.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'LikePost {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)


def already_like(post_id, current_user):
    data = LikePost.query.filter(LikePost.user_id == current_user.id).filter(
        LikePost.post_id == post_id).first()
    if data:
        return True
    return False


def initialize_routes(api):
    api.add_resource(
        PostLikesListEndpoint,
        '/api/posts/<post_id>/likes',
        '/api/posts/<post_id>/likes/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )

    api.add_resource(
        PostLikesDetailEndpoint,
        '/api/posts/<post_id>/likes/<id>',
        '/api/posts/<post_id>/likes/<id>/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
