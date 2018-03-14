# encoding:utf-8
from flask import Flask, jsonify, request, make_response
from functools import wraps

app = Flask(__name__)


def allow_cross_domain(fun):
    @wraps(fun)
    def wrapper_fun(*args, **kwargs):
        rst = make_response(fun(*args, **kwargs))
        rst.headers['Access-Control-Allow-Origin'] = '*'
        rst.headers['Access-Control-Allow-Methods'] = 'PUT,GET,POST,DELETE'
        allow_headers = "Referer,Accept,Origin,User-Agent"
        rst.headers['Access-Control-Allow-Headers'] = allow_headers
        return rst
    return wrapper_fun


@app.route('/v1/user/<user_id>')
@allow_cross_domain
def get_albums(user_id):
    import ncmbot
    import json
    import random
    print('vistor IP: ' + request.remote_addr)
    rows = int(request.args.get('rows'))
    columns = int(request.args.get('columns'))
    play_lists = ncmbot.user_play_list(uid=user_id)
    pl_content = play_lists.content
    love_play_list = json.loads(pl_content)["playlist"][0]
    love_play_list_id = love_play_list['id']
    love_play_list_details = ncmbot.play_list_detail(id=love_play_list_id, limit=1000)
    lpld_content = love_play_list_details.content
    love_song_id_list = json.loads(lpld_content)["playlist"]["trackIds"]
    love_song_id_list = [x["id"] for x in love_song_id_list]
    # print str(love_song_id_list)
    list_size = min(len(love_play_list), 50)
    request_song_id_list = random.sample(love_song_id_list, list_size)
    song_detail = ncmbot.song_detail(request_song_id_list)
    song_detail = song_detail.json()
    songs_list = song_detail["songs"]
    song_base_url = "http://music.163.com/#/album?id="
    ret = {"data": []}
    for song in songs_list:
        pic_url = song["al"]["picUrl"] + "?param=130y130"
        album_name = song["al"]["name"]
        album_id = song["al"]["id"]
        album_url = song_base_url + str(album_id)
        # print album_url, album_name, pic_url
        song_dict = {"song_url": album_url, "album_name": album_name, "pic_url": pic_url}
        ret["data"].append(song_dict)
    result_size = rows*columns
    album_id_set = set()
    count = 0
    while len(album_id_set) != result_size and count < 5:
        ret["data"] = random.sample(ret["data"], result_size)
        album_id_set = set(x["pic_url"] for x in ret["data"])
        count += 1

    return jsonify(ret)


if __name__ == '__main__':
    app.run()
