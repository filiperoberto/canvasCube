CanvasRenderingContext2D.prototype.dashedLine = function (x1, y1, x2, y2, dashLen) {
    if (dashLen == undefined) dashLen = 2;

    this.beginPath();
    this.moveTo(x1, y1);

    var dX = x2 - x1;
    var dY = y2 - y1;
    var dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLen);
    var dashX = dX / dashes;
    var dashY = dY / dashes;

    var q = 0;
    while (q++ < dashes) {
        x1 += dashX;
        y1 += dashY;
        this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x1, y1);
    }
    this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x2, y2);

    this.stroke();
    this.closePath();
};

Array.prototype.contains = function(value)
{
    for (var i = 0; i < this.length; i++) {
        if (this[i] === value) {
            return true;
        }
    }
    return false;
};

function Point3D(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.arbitraryrotate = function(axis,point,angle)
    {
        var t = this;
        var a = point.x;
        var b = point.y;
        var c = point.z;
        var u = axis.x;
        var v = axis.y;
        var w = axis.z;
        var L = Math.pow(u,2) + Math.pow(v,2) + Math.pow(w,2);
        var cosa = Math.cos(angle * Math.PI / 180);
        var sina = Math.sin(angle * Math.PI / 180);

        var x = ((a*(Math.pow(v,2) + Math.pow(w,2)) - u*(b*v + c*w - u*t.x - v*t.y - w*t.z))*(1-cosa) + L*t.x*cosa + Math.sqrt(L)*(-c*v + b*w - w*t.y + v*t.z)*sina)/L;
        var y = ((b*(Math.pow(u,2) + Math.pow(w,2)) - v*(a*u + c*w - u*t.x - v*t.y - w*t.z))*(1-cosa) + L*t.y*cosa + Math.sqrt(L)*( c*u - a*w + w*t.x - u*t.z)*sina)/L;
        var z = ((c*(Math.pow(u,2) + Math.pow(v,2)) - w*(a*u + b*v - u*t.x - v*t.y - w*t.z))*(1-cosa) + L*t.z*cosa + Math.sqrt(L)*(-b*u + a*v - v*t.x + u*t.y)*sina)/L;

        return new Point3D(x,y,z);
    };

    this.arbitraryrotateAxis = function(axis,point,angle)
    {
        return this.arbitraryrotate(axis,point,angle);
    };

    this.arbitraryrotateX = function(point,angle)
    {
        return this.arbitraryrotate(new Point3D(1,0,0),point,angle);
    };

    this.arbitraryrotateY = function(point,angle)
    {
        return this.arbitraryrotate(new Point3D(0,1,0),point,angle);
    };

    this.arbitraryrotateZ = function(point,angle)
    {
        return this.arbitraryrotate(new Point3D(0,0,1),point,angle);
    };

    this.rotateX = function (angle) {
        var rad, cosa, sina, y, z;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        y = this.y * cosa - this.z * sina;
        z = this.y * sina + this.z * cosa;
        return new Point3D(this.x, y, z)
    };

    this.rotateY = function (angle) {
        var rad, cosa, sina, x, z;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        z = this.z * cosa - this.x * sina;
        x = this.z * sina + this.x * cosa;
        return new Point3D(x, this.y, z)
    };

    this.rotateZ = function (angle) {
        var rad, cosa, sina, x, y;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        x = this.x * cosa - this.y * sina;
        y = this.x * sina + this.y * cosa;
        return new Point3D(x, y, this.z)
    };

    this.scale = function(sx,sy,sz)
    {
        x = this.x * sx;
        y = this.y * sy;
        z = this.z * sz;

        return new Point3D(x,y,z);
    };

    this.translate = function(tx,ty,tz)
    {
        x = this.x + tx;
        y = this.y + ty;
        z = this.z + tz;

        return new Point3D(x,y,z);
    };

    this.project = function (viewWidth, viewHeight, fov, viewDistance) {
        var factor, x, y;
        factor = fov / viewDistance;
        x = this.x * factor + viewWidth / 2;
        y = this.y * factor + viewHeight / 2;
        return new Point3D(x, y, this.z)
    };

    this.scalarproduct = function(point)
    {
        return this.x * point.x + this.y * point.y + this.z * point.z;
    };

    this.module = function()
    {
        var self = this;
        return Math.sqrt( Math.pow(self.x,2) + Math.pow(self.y,2) + Math.pow(self.z,2) )
    };

    this.equals = function(point)
    {
        return this.x == point.x && this.y == point.y && this.x == point.z;
    };

    this.angle = function(point,origin)
    {
        var Q = this.translate(-origin.x,-origin.y,-origin.z);
        var M = point.translate(-origin.x,-origin.y,-origin.z);

        var dot_product = Q.scalarproduct(M);
        var Q_module = Q.module();
        var M_module = M.module();

        var cosa = dot_product / Q_module * M_module;

        return Math.acos(cosa) * 180 / Math.PI;
    };

    this.toString = function()
    {
        return 'x: '+this.x+',y: '+this.y+',z: '+this.z;
    };

    this.reflect = function()
    {
        return new Point3D(-this.x,-this.y,-this.z);
    }
}

function Cube(__canvas)
{
    var canvas = __canvas;
    var ctx;
    var fixedFaces = {
        0 : 'Z',
        1 : 'X',
        2 : 'Z',
        3 : 'X',
        4 : 'Y',
        5 : 'Y'
    };

    var rotationAxis = {
        actual : 'x',
        last : 'y',
        value : new Point3D(0,1,0),
        x : new Point3D(1,0,0),
        y : new Point3D(0,1,0),
        z : new Point3D(0,0,1),
        actualAngle : {
            x : 0,
            y : 0,
            z : 0
        }
    };

    var actualScale = {
        0 : {value:1,multiplier:-1},
        1 : {value:1,multiplier:1},
        2 : {value:1,multiplier:1},
        3 : {value:1,multiplier:-1},
        4 : {value:1,multiplier:1},
        5 : {value:1,multiplier:-1}
    };

    this.backgroundColor = "rgb(0,0,0)";
    this.backgroundOpacity = 1;
    this.drawCircles = false;
    this.drawCircleNumbers = false;
    this.drawNumbers = false;
    this.drawCenter = false;
    this.viewDistance = 0.8;
    this.circlesRadius = 10;
    this.dashedPattern = 5;
    this.drawAxis = false;
    this.height = 818;
    this.width = 554;
    this.zoom = 128;

    this.colors = [
        {paint:false, color:[255, 0, 0], opacity:1},
        {paint:false, color:[0, 255, 0], opacity:1},
        {paint:false, color:[0, 0, 255], opacity:1},
        {paint:false, color:[255, 255, 0], opacity:1},
        {paint:false, color:[0, 255, 255], opacity:1},
        {paint:false, color:[255, 0, 255], opacity:1}
    ];

    var translation = new Point3D(0,0,0);

    this.faces = [
        [0, 1, 2, 3],
        [1, 5, 6, 2],
        [5, 4, 7, 6],
        [4, 0, 3, 7],
        [0, 4, 5, 1],
        [3, 2, 6, 7]
    ];

    this.vertices = [
        new Point3D(-1, 1, -1),
        new Point3D(1, 1, -1),
        new Point3D(1, -1, -1),
        new Point3D(-1, -1, -1),
        new Point3D(-1, 1, 1),
        new Point3D(1, 1, 1),
        new Point3D(1, -1, 1),
        new Point3D(-1, -1, 1)
    ];

    var rotationAxisFace = {
        x : {0:1,1:3},
        y : {0:4,1:5},
        z : {0:2,1:0}
    };

    this.actualVertices = this.vertices;
    this.actualVerticesScale1 = this.vertices;

    this.init = function()
    {
        if (canvas && canvas.getContext) {
            ctx = canvas.getContext("2d");
        }
        this.width = canvas.width;
        this.height = canvas.height;

        var coisa = projectVertices.apply(this,[this.vertices]);
        this.draw(coisa)
    };

    this.draw = function(t)
    {
        if(t === undefined)
            t = projectVertices.apply(this,[this.actualVertices]);

        drawBackGround.call(this);
        ctx.strokeStyle = "rgb(255,255,255)";
        ctx.lineJoin = "round";

        var avg_z = calculateAvg_Z.apply(this,[t]);

        var avg_total_z = calculateAvg_Z_Total.apply(this,[avg_z]);

        var centers = calculateCenterFaces.call(this);

        var centerDone = false;
        var axisDone = false;

        if (this.drawNumbers)
            for (i = 0; i < t.length; i++) {
                var actualStroke = ctx.strokeStyle;
                drawLine(t[i],t[i].translate(8,-8),'rgb(0,255,0)');
                drawText(t[i].x+8, t[i].y-8,i,'rgb(0,255,0)');

                ctx.strokeStyle = actualStroke;
            }

        for (var i = 0; i < this.faces.length; i++) {
            var f = this.faces[avg_z[i].index];

            if(this.drawCircles)
            {
                if (avg_z[i].z > avg_total_z)
                    ctx.globalAlpha = 0.3;
                else
                    ctx.globalAlpha = 1;

                var circle = centers[avg_z[i].index].translate(-translation.x,-translation.y,-translation.z).project(this.width, this.height, this.zoom, this.viewDistance);
                drawCircle.apply(this,[circle.x, circle.y]);
//                drawText(circle.x - 3, circle.y + 4, fixedFaces[avg_z[i].index]);
                if(this.drawCircleNumbers)
                    drawText(circle.x - 3, circle.y + 4, avg_z[i].index);
            }

            ctx.beginPath();

            if (avg_z[i].z > avg_total_z) {
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.3;

                drawDashedLine.apply(this,[{from:{x:t[f[0]].x, y:t[f[0]].y}, to:{x:t[f[1]].x, y:t[f[1]].y}}, f[0], f[1]]);
                drawDashedLine.apply(this,[{from:{x:t[f[1]].x, y:t[f[1]].y}, to:{x:t[f[2]].x, y:t[f[2]].y}}, f[1], f[2]]);
                drawDashedLine.apply(this,[{from:{x:t[f[2]].x, y:t[f[2]].y}, to:{x:t[f[3]].x, y:t[f[3]].y}}, f[2], f[3]]);

                if (this.colors[avg_z[i].index].paint) {
                    ctx.closePath();
                    ctx.stroke();
                    ctx.beginPath();

                    ctx.strokeStyle = this.arrayToRGB(this.colors[avg_z[i].index].color);
                    ctx.globalAlpha = 0;
                    ctx.moveTo(t[f[0]].x, t[f[0]].y);
                    ctx.lineTo(t[f[1]].x, t[f[1]].y);
                    ctx.lineTo(t[f[2]].x, t[f[2]].y);
                    ctx.lineTo(t[f[3]].x, t[f[3]].y);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.strokeStyle = "rgb(255,255,255)";
                }
            }
            else {
                ctx.lineWidth = 2;
                ctx.moveTo(t[f[0]].x, t[f[0]].y);
                ctx.lineTo(t[f[1]].x, t[f[1]].y);
                ctx.lineTo(t[f[2]].x, t[f[2]].y);
                ctx.lineTo(t[f[3]].x, t[f[3]].y);
                ctx.globalAlpha = 1;
                ctx.closePath();
                ctx.stroke();
            }

            if (this.colors[avg_z[i].index].paint) {
                ctx.fillStyle = this.arrayToRGB(this.colors[avg_z[i].index].color);
                ctx.globalAlpha = this.colors[avg_z[i].index].opacity;
                ctx.fill();
            }

            if(i < 3 && !centerDone && this.drawCenter)
            {
                ctx.globalAlpha = 1;
                var center = calculateCenter.call(this);
                center = center.translate(-translation.x,-translation.y,-translation.z).project(this.width, this.height, this.zoom, this.viewDistance);

                drawCircle.apply(this,[center.x,center.y,'rgb(0,150,255)']);
                drawText(center.x - 4,center.y + 3,'O');
                centerDone = true;

            }

            if(i<3 && !axisDone && this.drawAxis)
            {
                if(this.drawAxis)
                {
                    var actualstroke = ctx.strokeStyle;

                    var uno = rotationAxis.x.scale(.5,.5,.5).translate(-translation.x, -translation.y, -translation.z).project(this.width, this.height, this.zoom, this.viewDistance);
                    var uno_ = rotationAxis.x.scale(.5,.5,.5).reflect().translate(-translation.x, -translation.y, -translation.z).project(this.width, this.height, this.zoom, this.viewDistance);
                    drawText(uno.x - 4, uno.y + 3, 'x');
                    drawText(uno_.x - 4, uno_.y + 3, 'x');
                    drawLine.apply(this, [uno, uno_]);

                    var dos = rotationAxis.y.scale(.5,.5,.5).translate(-translation.x, -translation.y, -translation.z).project(this.width, this.height, this.zoom, this.viewDistance);
                    var dos_ = rotationAxis.y.scale(.5,.5,.5).reflect().translate(-translation.x, -translation.y, -translation.z).project(this.width, this.height, this.zoom, this.viewDistance);
                    drawText(dos.x - 4, dos.y + 3, 'y');
                    drawText(dos_.x - 4, dos_.y + 3, 'y');
                    drawLine.apply(this, [dos, dos_]);

                    var tres = rotationAxis.z.scale(.5,.5,.5).translate(-translation.x, -translation.y, -translation.z).project(this.width, this.height, this.zoom, this.viewDistance);
                    var tres_ = rotationAxis.z.scale(.5,.5,.5).reflect().translate(-translation.x, -translation.y, -translation.z).project(this.width, this.height, this.zoom, this.viewDistance);
                    drawText(tres.x - 4, tres.y + 3, 'z');
                    drawText(tres_.x - 4, tres_.y + 3, 'z');
                    drawLine.apply(this, [tres, tres_]);

                    ctx.strokeStyle = actualstroke;
                    axisDone = true;
                }
            }
        }


    };


    this.scaleFace = function(face,scale)
    {
        var vertices = processScale.apply(this, [face, (-1 + actualScale[face].value * actualScale[face].multiplier)*-1]);

        this.actualVertices = vertices;

        var value = -1 + scale * actualScale[face].multiplier;

        vertices = processScale.apply(this, [face, value]);

        this.actualVertices = vertices;

        var center = calculateCenter.call(this);
        var origin = new Point3D(0,0,0);
        var dif = new Point3D(origin.x - center.x,origin.y - center.y,origin.z - center.z);

        for(var i = 0;i<vertices.length;i++)
        {
            vertices[i] = vertices[i].translate(dif.x,dif.y,dif.z);
        }
        translation = translation.translate(dif.x,dif.y,dif.z);

        var t = projectVertices.apply(this, [vertices]);

        actualScale[face].value = scale;

        this.draw(t);
    };

    function processScale(face,_scale)
    {
        var self = this;
        var vertices = self.actualVertices;
        var axis = fixedFaces[face].toLowerCase();

        var scaleAxis = rotationAxis[axis];

        for(var i = 0;i<vertices.length;i++)
        {
            if(self.faces[face].contains(i))
            {
                var Sx = scaleAxis.x*_scale;
                var Sy = scaleAxis.y*_scale;
                var Sz = scaleAxis.z*_scale;
                vertices[i] = vertices[i].translate(Sx,Sy,Sz);

            }
        }

        return vertices;
    }

    this.rotate = function(angleX,angleY,angleZ)
    {
        var angles = {
            x : angleX,
            y : angleY,
            z : angleZ
        };

        for(var key in angles)
        {
            if (angles.hasOwnProperty(key))
                if (angles[key] !== undefined)
                    drawRotation.apply(this, [angles[key], key])
        }

    };

    function drawRotation(angle,axis)
    {
        var self = this;
        rotationAxis.actual = axis;
        var vertices = processRotation.apply(this, [angle, axis]);
        var t = projectVertices.apply(this, [vertices]);

        self.draw(t);
    }

    function processRotation(_angle,axis)
    {
        var self = this;
        var vertices = new Array();
        var center = calculateCenter.call(this);

        var faces = calculateCenterFaces.call(this);

        var angle = _angle - rotationAxis.actualAngle[axis];
        if(rotationAxis.actual != rotationAxis.last)
        {
            rotationAxis[axis] = faces[rotationAxisFace[axis][0]];
            rotationAxis.value = rotationAxis[axis];
            rotationAxis.last = rotationAxis.actual;
        }
        for(var i = 0; i < self.actualVertices.length;i++)
        {
            var r = self.actualVertices[i];
            r = r.arbitraryrotateAxis(rotationAxis.value,center,angle);
            vertices.push(r);
        }

        self.actualVertices = vertices;

        faces = calculateCenterFaces.call(this);

        rotationAxis.x = faces[rotationAxisFace.x[0]];
        rotationAxis.y = faces[rotationAxisFace.y[0]];
        rotationAxis.z = faces[rotationAxisFace.z[0]];

        rotationAxis.actualAngle[axis] = _angle;

        return vertices;
    }

    this.animate =
    {
        doAnimation:function (cube) {
            var self = this;
            var last = 'x';

            if (!this.enabled) {
                this.interval = setInterval(function () {

                    if (!self.justAnAxis) {
                        cube.rotate(self.angle, self.angle, self.angle);
                    }
                    else {

                        if(self.axis != last)
                        {
                            self.angle = rotationAxis.actualAngle[self.axis];
                            last = self.axis;
                        }
                        switch (self.axis) {
                            case 'x':
                                cube.rotate(self.angle);
                                break;
                            case 'y':
                                cube.rotate(undefined, self.angle);
                                break;
                            case 'z':
                                cube.rotate(undefined, undefined, self.angle);
                        }
                    }
                    self.angle++;

                }, this.speed);
                this.enabled = true;
            }
            else {
                this.enabled = false;
                clearInterval(this.interval);
            }
        },
        justAnAxis : false,
        axis : 'x',
        angle : 0,
        speed : 75,
        enabled : false,
        interval : undefined
    };

    this.setOpacity = function (faces, value) {
        if(value == 0)
            this.hideColors(faces);
        else
            this.showColors(faces);
        for (var i = 0; i < faces.length; i++) {
            if (faces[i] >= 0 && faces[i] < 6)
                this.colors[faces[i]].opacity = value;
        }
        this.draw();
    };

    this.showColors = function (faces) {
        for (var i = 0; i < faces.length; i++) {
            if (faces[i] >= 0 && faces[i] < 6)
                this.colors[faces[i]].paint = true;
        }
        this.draw();
    };

    this.hideColors = function (faces) {
        for (var i = 0; i < faces.length; i++) {
            if (faces[i] >= 0 && faces[i] < 6)
                this.colors[faces[i]].paint = false;
        }
        this.draw();
    };

    this.arrayToRGB = function (arr) {
        if (arr.length == 3) {
            return "rgb(" + arr[0] + "," + arr[1] + "," + arr[2] + ")";
        }
        return "rgb(0,0,0)";
    };

    this.erase = function()
    {
        ctx.fillStyle = this.backgroundColor;
        ctx.globalAlpha = this.backgroundOpacity;
        ctx.fillRect(0, 0, this.width, this.height);
    };

    this.getFace =function(x,y)
    {
        var faces = calculateCenterFaces.call(this);
        for(var i=0;i<faces.length;i++)
        {
            var face = faces[i].translate(-translation.x,-translation.y,-translation.z).project(this.width, this.height, this.zoom, this.viewDistance);

            if(x < (face.x + this.circlesRadius*2) && x > (face.x - this.circlesRadius*2) && y < (face.y + this.circlesRadius*2) && y > (face.y - this.circlesRadius*2))
                return i;
        }
        return undefined;

    };


    var done = new Array();

    function doneContains(a, b) {
        for (var i = 0; i < done.length; i++) {
            if (done[i][0] == b && done[i][1] == a)
                return true;
        }
        return false;
    }

    function projectVertices(vertices)
    {
        var projected = new Array();
        var self = this;

        for(var i = 0;i < vertices.length;i++)
        {
            projected.push(vertices[i].translate(-translation.x,-translation.y,-translation.z).project(self.width, self.height, self.zoom, self.viewDistance))
        }

        return projected;
    }

    function drawDashedLine(line, pointA, pointB) {
        var self = this;
        if (!doneContains(pointA, pointB)) {
            done[done.length] = new Array(pointA, pointB);
            ctx.dashedLine(line.from.x, line.from.y, line.to.x, line.to.y, self.dashedPattern);
        }
        else {
            ctx.moveTo(line.to.x, line.to.y);
        }
    }

    function drawText(x,y,text,color)
    {
        if(text != undefined)
        {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.font = "10px Arial";
            if(color)
                ctx.fillStyle = color;
            else
                ctx.fillStyle = "rgb(255,255,255)";
            ctx.fillText(text, x, y, 10);
            ctx.closePath();
            ctx.stroke();
        }
    }

    function drawLine(from,to,color)
    {
        ctx.beginPath();
        if(color)
            ctx.strokeStyle = color;
        else
            ctx.strokeStyle = "rgb(255,0,0)";
        ctx.globalAlpha = 0.5;
        ctx.moveTo(from.x,from.y);
        ctx.lineTo(to.x,to.y);
        ctx.closePath();
        ctx.stroke();
    }

    function drawCircle(x,y,color)
    {
        var self = this;
        ctx.beginPath();
        if(color)
            ctx.fillStyle = color;
        else
            ctx.fillStyle = 'rgb(255,0,0)';
        ctx.arc(x, y, self.circlesRadius, 0, Math.PI * 2, true);

        ctx.closePath();
        ctx.fill();
    }

    function drawBackGround()
    {
        var self = this;
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, self.width, self.height);
    }

    function calculateAvg_Z_Total(avg_z) {
        var avg_total_z = 0;
        for (i = 0; i < avg_z.length; i++) {
            avg_total_z += avg_z[i].z;
        }
        avg_total_z /= avg_z.length;
        return avg_total_z;
    }

    function calculateAvg_Z(t) {
        var self = this;
        var avg_z = new Array();

        for (i = 0; i < self.faces.length; i++) {
            f = self.faces[i];
            avg_z[i] = {"index":i, "z":(t[f[0]].z + t[f[1]].z + t[f[2]].z + t[f[3]].z) / 4.0};
        }

        avg_z.sort(function (a, b) {
            return b.z - a.z;
        });
        return avg_z;
    }

    function calculateCenterFaces()
    {
        var self = this;
        var centers = new Array();
        for(i = 0;i < self.faces.length;i++)
        {
            centers[i] = new Point3D((self.actualVertices[self.faces[i][0]].x + self.actualVertices[self.faces[i][2]].x) / 2, (self.actualVertices[self.faces[i][0]].y + self.actualVertices[self.faces[i][2]].y) / 2, (self.actualVertices[self.faces[i][0]].z + self.actualVertices[self.faces[i][2]].z) / 2);
        }
        return centers;
    }

    function calculateCenter()
    {
        var self = this;
        return new Point3D((self.actualVertices[0].x+self.actualVertices[6].x)/2,(self.actualVertices[0].y+self.actualVertices[6].y)/2,(self.actualVertices[0].z+self.actualVertices[6].z)/2)
    }
}
