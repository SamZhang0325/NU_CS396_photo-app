from flask import Response, request
from flask_restful import Resource
from models import Bookmark, db, post
from . import check_int
import json
from . import can_view_post


class BookmarksListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    def get(self):
        data = Bookmark.query.filter(
            Bookmark.user_id == self.current_user.id).all()
        data = [
            item.to_dict() for item in data
        ]
        if not data:
            return Response(json.dumps({'message': 'You do not have any bookmark'}), mimetype="application/json", status=404)
        return Response(json.dumps(data), mimetype="application/json", status=200)

    def post(self):
        body = request.get_json()
        post_id = body.get('post_id')
        if not check_int(post_id):
            return Response(json.dumps({'message': 'Invalid input'}), mimetype="application/json", status=400)
        user = self.current_user
        if not can_view_post(post_id, user):
            return Response(json.dumps({'message': 'Post does not exist'}), mimetype="application/json", status=404)
        if already_bookmark(post_id, user):
            return Response(json.dumps({'message': 'Already add to bookmark'}), mimetype="application/json", status=400)
        data = Bookmark(user.id, post_id)
        db.session.add(data)
        db.session.commit()
        return Response(json.dumps(data.to_dict()), mimetype="application/json", status=201)


class BookmarkDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    def delete(self, id):
        if not check_int(id):
            return Response(json.dumps({'message': 'Invalid input'}), mimetype="application/json", status=400)
        data = Bookmark.query.get(id)
        if not data or data.user_id != self.current_user.id:
            return Response(json.dumps({'message': 'Post does not exist'}), mimetype="application/json", status=404)
        Bookmark.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Bookmark {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)


def already_bookmark(post_id, current_user):
    data = Bookmark.query.filter(Bookmark.user_id == current_user.id).filter(
        Bookmark.post_id == post_id).first()
    if data:
        return True
    return False


def initialize_routes(api):
    api.add_resource(
        BookmarksListEndpoint,
        '/api/bookmarks',
        '/api/bookmarks/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )

    api.add_resource(
        BookmarkDetailEndpoint,
        '/api/bookmarks/<id>',
        '/api/bookmarks/<id>',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
