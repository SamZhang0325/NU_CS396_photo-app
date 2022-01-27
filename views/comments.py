from flask import Response, request
from flask_restful import Resource
from . import can_view_post
import json
from models import db, Comment, Post


class CommentListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    def post(self):
        body = request.get_json()
        post_id = body.get('post_id')
        text = body.get('text')
        user = self.current_user
        if not can_view_post(post_id, user):
            return Response(json.dumps({'message': 'Post does not exist'}), mimetype="application/json", status=404)

        data = Comment(text, user.id, post_id)
        db.session.add(data)
        db.session.commit()
        return Response(json.dumps(data.to_dict()), mimetype="application/json", status=201)


class CommentDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    def delete(self, id):
        data = Comment.query.get(id)
        if not data or data.user_id != self.current_user.id:
            return Response(json.dumps({'message': 'Post does not exist'}), mimetype="application/json", status=404)
        Comment.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Comment {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        CommentListEndpoint,
        '/api/comments',
        '/api/comments/',
        resource_class_kwargs={'current_user': api.app.current_user}

    )
    api.add_resource(
        CommentDetailEndpoint,
        '/api/comments/<id>',
        '/api/comments/<id>',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
