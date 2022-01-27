from flask import Response, request
from flask_restful import Resource
from models import Bookmark, db
import json
from . import can_view_post

class BookmarksListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
        data = Bookmark.query.filter(Bookmark.user_id == self.current_user.id).all()
        data = [
            item.to_dict() for item in data
        ]
        if not data:
            return Response(json.dumps({'message': 'You do not have any bookmark'}), mimetype="application/json", status=404)
        return Response(json.dumps(data), mimetype="application/json", status=200)

    def post(self):
        # Your code here
        return Response(json.dumps({}), mimetype="application/json", status=201)

class BookmarkDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def delete(self, id):
        # Your code here
        return Response(json.dumps({}), mimetype="application/json", status=200)



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
