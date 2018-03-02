/**
 * author: pinyo
 * date: 2017/8/8
 */
(function (d) {
    var i, count = 0;
    var client_url, client_id, client_secret, client_theme;
    var apiUrl = 'http://localhost:5000/v1/user/';

    function queryclass(name) {
        if (d.querySelectorAll) {
            return d.querySelectorAll('.' + name);
        }
        var elements = d.getElementsByTagName('div');
        var ret = [];
        for (i = 0; i < elements.length; i++) {
            if (~elements[i].className.split(' ').indexOf(name)) {
                ret.push(elements[i]);
            }
        }
        return ret;
    }

    function querydata(element, name) {
        return element.getAttribute('data-' + name);
    }

    function heighty(iframe) {
        if (window.addEventListener) {
            window.addEventListener('message', function (e) {
                if (iframe.id === e.data.sender) {
                    iframe.height = e.data.height;
                }
            }, false);
        }
    }

    function store(key, value) {
        try {
            if (window.localStorage) {
                if (value) {
                    value._timestamp = new Date().valueOf();
                    localStorage[key] = JSON.stringify(value);
                } else {
                    var ret = localStorage[key];
                    if (ret) {
                        return JSON.parse(ret);
                    }
                    return null;
                }
            }
        } catch (e) {
        }
    }

    function request(url, callback) {
        var cache = store(url);
        if (cache && cache._timestamp) {
            // cache for 6 hours
            if (new Date().valueOf() - cache._timestamp < 21600000) {
                return callback(cache);
            }
        }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function () {
            console.log(xhr.response);
            callback(JSON.parse(xhr.response));
        };
        xhr.send();
    }

    function render(widget) {
        var userid = querydata(widget, 'userid');
        var url = apiUrl + userid;
        if (!userid) {
            return;
        }
        count += 1;
        var rows = querydata(widget, 'rows');
        var columns = querydata(widget, 'columns');
        var identity = 'music-widget-' + userid + '-' + count;

        url += "?rows=" + rows + "&columns=" + columns;
        var table = d.createElement('table');
        table.setAttribute('id', identity);
        table.setAttribute('width', '600');
        table.setAttribute("cellpadding", "10");
        var tbody = d.createElement('tbody');
        request(url, function (data) {
            data = data || {};
            for (var i = 0; i < rows; i++) {
                var tr = d.createElement('tr');
                tr.setAttribute('align', "center");
                for (var j = 0; j < columns; j++) {
                    var td = d.createElement('td');
                    var a = d.createElement('a');
                    var song_details = data["data"][i * columns + j];
                    console.log(i * columns + j);
                    a.setAttribute('href', song_details["song_url"]);
                    a.setAttribute('title', song_details["album_name"]);
                    a.setAttribute('target', "_blank");
                    var img = d.createElement('img');
                    img.setAttribute('src', song_details["pic_url"]);
                    img.setAttribute('border', "0");
                    img.setAttribute('max-width', "100");
                    a.appendChild(img);
                    td.appendChild(a);
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            }

            //添加底栏1
            var foot_tr_1 = d.createElement('tr');
            var foot_td_1 = d.createElement('td');
            var foot_a_1 = d.createElement('a');
            var foot_text = d.createTextNode("我的网易云音乐主页");
            var home_page = "http://music.163.com/#/user/home?id=" + userid;
            foot_a_1.setAttribute("href", home_page);
            foot_a_1.setAttribute('target', "_blank");
            foot_a_1.setAttribute("style", "color:#5394fc;text-decoration:none;");
            foot_a_1.appendChild(foot_text);
            foot_td_1.appendChild(foot_a_1);
            foot_td_1.setAttribute("colspan", columns);
            foot_tr_1.appendChild(foot_td_1);
            foot_tr_1.setAttribute('align', "center");
            tbody.appendChild(foot_tr_1);

            //添加底栏2
            var foot_img = d.createElement('img');
            var foot_a_2 = d.createElement('a');
            var foot_td_2 = d.createElement('td');
            var foot_tr_2 = d.createElement('tr');
            foot_img.setAttribute("src", "../img/163music.png");
            foot_img.setAttribute("border", "0");
            foot_a_2.setAttribute('href', "http://music.163.com");
            foot_a_2.appendChild(foot_img);
            foot_td_2.setAttribute("colspan", columns);
            foot_td_2.appendChild(foot_a_2);
            foot_tr_2.setAttribute('align', "center");
            foot_tr_2.appendChild(foot_td_2);
            tbody.appendChild(foot_tr_2);

            table.appendChild(tbody);
        });

        widget.parentNode.replaceChild(table, widget);
        return table;
    }

    var widgets = queryclass('music-widget');
    for (i = 0; i < widgets.length; i++) {
        render(widgets[i]);
    }
})(document);
