function startSimulation(windowSize, frequency, delay, timeout) {
    console.log("window size : " + windowSize)
    console.log("frequency of packets : " + frequency);
    console.log("delay : ", delay);
    console.log("timeout : ", timeout);
    document.querySelector("#start-stop-button").onclick = stop;
    document.querySelector("#start-stop-button").value = "Stop";
    windowSize = parseInt(windowSize);
    frequency = parseFloat(frequency);
    delay = parseFloat(delay);
    timeout = parseFloat(timeout);

    paper.setup('simulation-frame');
    var senderFrames = [];// vettore contenente il "mittente"
    for (var i = 0; i < 30; i++) {
        var o = {
            path: new Path.Rectangle([5 + 25 * i, 10], [20, 30]),  //creazione del rettangolo
            start: -1,
            timer: timeout,
            awk: false,
            text: new PointText({
                point: new Point(5 + 25 * i + 10, 50),
                justification: 'center',				//numero scritto dentro il rettangolo
                fontSize: 10,
                fillColor: 'black',
                content: 'af'
            }),
            seqno: new PointText({
                point: new Point(5 + 25 * i + 10, 25),  
                justification: 'center',	
                fontSize: 14,
                fillColor: 'black',
                content: i % (2 * windowSize)
            })
        };
        o.path.strokeColor = 'black';
        senderFrames.push(o); //inserimento nel vettore di ogni elemento
    }
    var senderWindow = new Path.Rectangle([3, 8], [25 * windowSize - 1, 34]);	//creazione della finestra del "mittente"
    //console.log(senderWindow);
    senderWindow.strokeColor = 'red';
    var recieverFrames = [];  //creazione del vettore per il "destinatario"
    for (var i = 0; i < 30; i++) {
        var o = {
            path: new Path.Rectangle([5 + 25 * i, 500 - 40], [20, 30]),
            awk: false,
            seqno: new PointText({
                point: new Point(5 + 25 * i + 10, 500 - 40 + 20),
                justification: 'center',
                fontSize: 14,
                fillColor: 'black',
                content: i % (2 * windowSize)
            })
        };
        o.path.strokeColor = 'black';
        recieverFrames.push(o);
    }
    var receiverWindow = new Path.Rectangle([3, 500 - 42], [25 * windowSize - 1, 34]);//creazione della finestra del "destinatario"
    receiverWindow.strokeColor = 'red';

    var packet = [];
    view.onMouseDown = function (event) {
        packet.forEach(function (e) { // 
            //console.log(e);
            if (Math.abs(e.path.position.x - event.point.x) < 20)
                if (Math.abs(e.path.position.y - event.point.y) < 30) {
                    e.path.position.x = -15;
                    packet = packet.filter(item => item !== e);
                }
        }, this);
    }
    var spos = 0, rpos = 0;
    view.onFrame = function (event) {
        var fps = 60;

        if (rpos + windowSize + 1 > 30) {
            // var canvas=document.querySelector("#simulation-frame").getContext('2d');
            // canvas.;
            for (var i = 0; i < 30; i++) {
                senderFrames[i].path.position.x -= 450;
                senderFrames[i].seqno.position.x -= 450;		//ricalibrazione della finestra
                senderFrames[i].text.position.x -= 450;
                recieverFrames[i].path.position.x -= 450;
                recieverFrames[i].seqno.position.x -= 450;
            }
            spos -= 18;
            rpos -= 18;
            senderWindow.position.x -= 450;
            receiverWindow.position.x -= 450;
            senderFrames = senderFrames.slice(18, 30);
            recieverFrames = recieverFrames.slice(18, 30);
            packet.forEach(function (e) {
                e.path.position.x -= 450;
                e.id -= 18;
            });
            var j = parseInt(senderFrames[0].seqno.content);
            for (var i = 12; i < 30; i++) {
                var o = {
                    path: new Path.Rectangle([5 + 25 * i, 10], [20, 30]),
                    start: -1,
                    timer: timeout,
                    awk: false,
                    text: new PointText({
                        point: new Point(5 + 25 * i + 10, 50),
                        justification: 'center',
                        fontSize: 10,
                        fillColor: 'black',
                        content: 'af'
                    }),
                    seqno: new PointText({
                        point: new Point(5 + 25 * i + 10, 25),
                        justification: 'center',
                        fontSize: 14,
                        fillColor: 'black',
                        content: (j + i) % (2 * windowSize)
                    })
                };
                o.path.strokeColor = 'black';
                senderFrames.push(o);
                o = {
                    path: new Path.Rectangle([5 + 25 * i, 500 - 40], [20, 30]),
                    awk: false,
                    seqno: new PointText({
                        point: new Point(5 + 25 * i + 10, 500 - 40 + 20),
                        justification: 'center',
                        fontSize: 14,
                        fillColor: 'black',
                        content: (j + i) % (2 * windowSize)
                    })
                };
                o.path.strokeColor = 'black';
                recieverFrames.push(o);
            }
        }/**/

        if (event.time < 2) {
            //start simulation after 2s
        }
        else if (parseInt(event.time * fps) % (frequency * fps) == 0) {

            //each send packets at a frequency
            for (var i = 0; i <= windowSize - 1; i++) {
                if (spos + i >= 30 || spos + i < 0)
                    continue;
                //console.log(spos+i);
                if (senderFrames[spos + i].start < 0 && !senderFrames[spos + i].awk) {
                    senderFrames[spos + i].start = event.time;
                    var o = {
                        path: senderFrames[spos + i].path.clone(),
                        id: spos + i,
                        awk: false
                    }
                    o.path.fillColor = '#333399';
                    packet.push(o);
                    break;
                }
            }
        }

        //check if timeout has come for any sender frame
        senderFrames.forEach(function (e) {

            if (!e.awk && e.start > 0) {
                e.text.content = (timeout + e.start - event.time + "").substr(0, 4);
                if (e.start + timeout < event.time) {
                    e.start = event.time;
                    var o = {
                        path: e.path.clone(),
                        id: senderFrames.indexOf(e),
                        awk: false
                    }
                    //console.log(o);
                    o.path.fillColor = '#333399';
                    packet.push(o);
                }
            }
            else {
                e.text.content = '';
            }
        });


        packet.forEach(function (e) {
            if (e.id >= 0) {
                //console.log("asd");
                if (e.awk) {
                    if (e.path.position.y > 10)
                        e.path.position.y += -450 / (delay * fps);
                    else {
                        senderFrames[e.id].awk = true;
                        senderFrames[e.id].path.fillColor = '#66AAAA';
                        e.path.position.x = -15;
                        packet = packet.filter(item => item !== e)
                    }
                }
                else {
                    if (e.path.position.y < 460)
                        e.path.position.y += 450 / (delay * fps);
                    else {
                        recieverFrames[e.id].awk = true;
                        recieverFrames[e.id].path.fillColor = '#333399'
                        e.awk = true;
                        e.path.fillColor = '#66AAAA'
                    }
                }
            }
        }, this);

        if (senderFrames[spos].awk) {
            senderWindow.position.x += 25;
            spos++;
        }
        if (recieverFrames[rpos].awk) {
            receiverWindow.position.x += 25;
            rpos++;
        }

        //console.log(spos);
    }
}

function stop() {
    view.onFrame = function (event) { };
    document.querySelector("#start-stop-button").value = "Refresh";
    document.querySelector("#start-stop-button").onclick = function () {
        window.location.reload();
    };
}