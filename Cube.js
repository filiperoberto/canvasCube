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
    }
}

function Cube(canvas) {
    this.canvas = canvas;
    this.backgroundOpacity = 1;
    this.viewDistance = 0.8;
    this.circlesRadius = 10;
    this.dashedPattern = 5;
    this.animatespeed = 75;
    this.lineOpacity = 1;
    this.height = 554;
    this.width = 818;
    this.zoom = 128;

    this.lineColor = "rgb(255,255,255)";
    this.backgroundColor = "rgb(0,0,0)";
    this.circlesColor = "rgb(255,0,0)";

    this.center = new Point3D(0,0,0);

    this.drawFaceNumber = false;
    this.drawAxisLines = false;
    this.scaleTwoFaces = false;
    this.drawCubeAxis = false;
    this.drawCircles = false;
    this.drawNumbers = false;

    this.animateAnAxis =
    {
        value : false,
        axis : 'x'
    };

    this.centerRotate = false;

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

    this.actualVertices = this.vertices;
    this.actualFaces = new Array();

    // Define the vertices that compose each of the 6 faces. These numbers are
// indices to the vertex list defined above.

    //     7 -- 6
    //    /|   /|     +y
    //   3 -- 2 |     |__ +x
    //   | 4 -|-5    /
    //   |/   |/   +z
    //   0 -- 1


    this.faces = [
        [0, 1, 2, 3],
        [1, 5, 6, 2],
        [5, 4, 7, 6],
        [4, 0, 3, 7],
        [0, 4, 5, 1],
        [3, 2, 6, 7]
    ];

    for(i = 0;i < this.faces.length;i++)
    {
        this.actualFaces[i] = new Point3D((this.actualVertices[this.faces[i][0]].x + this.actualVertices[this.faces[i][2]].x) / 2, (this.actualVertices[this.faces[i][0]].y + this.actualVertices[this.faces[i][2]].y) / 2, (this.actualVertices[0].z + this.actualVertices[2].z) / 2);
    }

    this.colors = [
        {paint:false, color:[255, 0, 0], opacity:1},
        {paint:false, color:[0, 255, 0], opacity:1},
        {paint:false, color:[0, 0, 255], opacity:1},
        {paint:false, color:[255, 255, 0], opacity:1},
        {paint:false, color:[0, 255, 255], opacity:1},
        {paint:false, color:[255, 0, 255], opacity:1}
    ];

    this.angles = {
        x:45,
        y:45,
        z:45,
        animate:45,
        last :
        {
            x : 0,
            y : 0,
            z : 0
        }
    };

    this.scales =
    {
        x:1,
        y:1,
        z:1,
        0:1,
        1:1,
        2:1,
        3:1,
        4:1,
        5:1
    };

    this.scaleFaces =
    {
        x:{
            0:1,
            1:3,
            active:3
        },
        y:{
            0:4,
            1:5,
            active:4
        },
        z:{
            0:0,
            1:2,
            active:0
        },
        axisForFace : function(face)
        {
            if(this.x[0] == face || this.x[1] == face)
                return 'x';
            if(this.y[0] == face || this.y[1] == face)
                return 'y';
            if(this.z[0] == face || this.z[1] == face)
                return 'z';
            return undefined;
        }
    };

    this.fixedVertice = {
        2:{
            5:{
                1:0,
                3:1
            },
            4:{
                1:3,
                3:2
            }
        },
        0:{
            5:{
                1:4,
                3:5
            },
            4:{
                1:7,
                3:6
            }
        }
    };

    this.fixedFaces = {
        x : [1,3],
        y : [4,5],
        z : [0,2],
        lastPosition : [new Point3D(0,0,0),new Point3D(0,0,0)]
    };

    var lastCenter = new Point3D(0,0,0);
    var lastAngleChange = {
        actual : 'x',
        last : 'y',
        value : 0,
        axis : new Point3D(1,0,0)
    };
    var defaultAxis = {
        x : new Point3D(1,0,0),
        y : new Point3D(0,1,0),
        z : new Point3D(0,0,1)
    };
    var cen1 = {x:0,y:0};
    var cen2 = {x:0,y:0};
    var scaled = false;
    var rotated = true;
    var moved = false;
    var lastposition;


    this.init = function () {
        if (this.canvas && this.canvas.getContext) {
            ctx = this.canvas.getContext("2d");
            var t = processVertices.apply(this,[this.vertices]);
            this.draw(t);
        }
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
        ctx.fillRect(0, 0, this.width, this.height);
    };


    this.draw = function (t) {

        var self = this;

        ctx.fillStyle = this.backgroundColor;
        ctx.globalAlpha = this.backgroundOpacity;
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.strokeStyle = this.lineColor;
        ctx.lineJoin = "round";

        if(t == undefined)
        {
            t = processVertices.call(self);
        }

        var avg_z = new Array();

        for (i = 0; i < this.faces.length; i++) {
            f = this.faces[i];
            avg_z[i] = {"index":i, "z":(t[f[0]].z + t[f[1]].z + t[f[2]].z + t[f[3]].z) / 4.0};
        }

        avg_z.sort(function (a, b) {
            return b.z - a.z;
        });

        var avg_total_z = 0;
        for (i = 0; i < avg_z.length; i++) {
            avg_total_z += avg_z[i].z;
        }
        avg_total_z /= avg_z.length;

        var done = new Array();

        for (var i = 0; i < this.faces.length; i++) {
            var f = this.faces[avg_z[i].index];

            if (this.drawCircles) {
                if (avg_z[i].z > avg_total_z)
                    ctx.globalAlpha = 0.3;
                else
                    ctx.globalAlpha = 1;
                var face = this.actualFaces[avg_z[i].index].project(self.width, self.height, self.zoom, self.viewDistance);
                drawCircle(face.x,face.y,this.drawFaceNumber ? avg_z[i].index : undefined)
            }
            ctx.globalAlpha = 1;

            ctx.beginPath();

            if (avg_z[i].z > avg_total_z) {
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.3;

                drawDashedLine({from:{x:t[f[0]].x, y:t[f[0]].y}, to:{x:t[f[1]].x, y:t[f[1]].y}}, f[0], f[1]);
                drawDashedLine({from:{x:t[f[1]].x, y:t[f[1]].y}, to:{x:t[f[2]].x, y:t[f[2]].y}}, f[1], f[2]);
                drawDashedLine({from:{x:t[f[2]].x, y:t[f[2]].y}, to:{x:t[f[3]].x, y:t[f[3]].y}}, f[2], f[3]);

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
                    ctx.strokeStyle = self.lineColor;
                }
            }
            else {
                ctx.lineWidth = 2;
                ctx.moveTo(t[f[0]].x, t[f[0]].y);
                ctx.lineTo(t[f[1]].x, t[f[1]].y);
                ctx.lineTo(t[f[2]].x, t[f[2]].y);
                ctx.lineTo(t[f[3]].x, t[f[3]].y);
                ctx.globalAlpha = this.lineOpacity;
                ctx.closePath();
                ctx.stroke();
            }


            if (this.colors[avg_z[i].index].paint) {
                ctx.fillStyle = this.arrayToRGB(this.colors[avg_z[i].index].color);
                ctx.globalAlpha = this.colors[avg_z[i].index].opacity;
                ctx.closePath();
                ctx.fill();
            }
            else {
                ctx.closePath();
                ctx.stroke();
            }

        }

        if (this.drawNumbers)
            for (i = 0; i < t.length; i++) {
                drawVerticeNumber(i, t[i].x, t[i].y)
            }

        if (this.drawAxisLines) {
            drawAxisLines();
        }

        function drawAxisLines() {
            var axis = [
                new Point3D(0, 0, 0),
                new Point3D(1, 0, 0),
                new Point3D(0, 1, 0),
                new Point3D(0, 0, 1)
            ];

            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "rgb(255,255,255)";

            var projectedX = axis[1].project(self.width, self.height, self.zoom, self.viewDistance);
            var projectedY = axis[2].project(self.width, self.height, self.zoom, self.viewDistance);
            var projectedZ = axis[3].project(self.width, self.height, self.zoom, self.viewDistance);
            var projectedOrigin = axis[0].project(self.width, self.height, self.zoom, self.viewDistance);

            ctx.moveTo(projectedX.x, projectedX.y);
            ctx.lineTo(projectedOrigin.x, projectedOrigin.y);
            ctx.lineTo(projectedY.x, projectedY.y);
            ctx.moveTo(projectedZ.x, projectedZ.y);
            ctx.lineTo(projectedOrigin.x, projectedOrigin.y);

            ctx.font = "10px Arial";
            ctx.fillStyle = "rgb(255,255,255)"
            ctx.fillText('x', projectedX.x + 5, projectedX.y + 5);
            ctx.fillText('y', projectedY.x + 5, projectedY.y + 5);
            ctx.fillText('z', projectedZ.x + 5, projectedZ.y + 5);

            ctx.closePath();
            ctx.stroke();
        }

        function drawVerticeNumber(number, x, y) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "rgb(255,0,0)";
            ctx.moveTo(x, y);
            ctx.lineTo(x - 8, y - 8);

            ctx.font = "10px Arial";
            ctx.fillStyle = "rgb(255,0,0)"
            ctx.fillText(number, x - 10, y - 10, 10);
            ctx.closePath();
            ctx.stroke();
        }

        function drawCircle(x, y, number) {
            ctx.beginPath();
            ctx.fillStyle = self.circlesColor;
            ctx.arc(x, y, self.circlesRadius, 0, Math.PI * 2, true);

            ctx.closePath();
            ctx.fill();

            if (number !== undefined) {
                ctx.beginPath();
                ctx.lineWidth = 1;
                ctx.font = "10px Arial";
                ctx.fillStyle = "rgb(255,255,255)"
                ctx.fillText(number, x - 2, y + 2, 10);
                ctx.closePath();
                ctx.stroke();
            }

        }


        function drawDashedLine(line, pointA, pointB) {
            if (!doneContains(pointA, pointB)) {
                done[done.length] = new Array(pointA, pointB);
                ctx.dashedLine(line.from.x, line.from.y, line.to.x, line.to.y, self.dashedPattern);
            }
            else {
                ctx.moveTo(line.to.x, line.to.y);
            }
        }

        function doneContains(a, b) {
            for (var i = 0; i < done.length; i++) {
                if (done[i][0] == b && done[i][1] == a)
                    return true;
            }
            return false;
        }

    };

    this.rotate = function (angleX, angleY, angleZ) {
        this.angles.last.x = this.angles.x;
        this.angles.last.y = this.angles.y;
        this.angles.last.z = this.angles.z;
        lastAngleChange.last= lastAngleChange.actual;
        if(this.angles.x != angleX && angleX !== undefined)
        {
            this.angles.x = angleX !== undefined ? angleX : this.angles.x;
            lastAngleChange.actual = 'x';
        }
        if(this.angles.y != angleY  && angleY !== undefined)
        {
            this.angles.y = angleY !== undefined ? angleY : this.angles.y;
            lastAngleChange.actual = 'y';
        }
        if(this.angles.z != angleZ  && angleZ !== undefined)
        {
            this.angles.z = angleZ !== undefined ? angleZ : this.angles.z;
            lastAngleChange.actual = 'z';
        }

        this.draw();
    };

    this.scaleFace = function(face,scale)
    {
        var axis = this.scaleFaces.axisForFace(face);
        if(axis !== undefined)
        {
            if(this.scaleFaces[axis].active != face)
            {
                this.scaleFaces[axis].active = face;
                this.draw();
            }
            this.scales[this.scaleFaces[axis].active] = scale;

            if(this.scaleFaces[axis][0]==face)
                scale += this.scales[this.scaleFaces[axis][1]]-1;
            else
                scale += this.scales[this.scaleFaces[axis][0]]-1;
            this.scale[axis](scale);
        }
    };

    this.scale = {
        cube:this,

        x : function (scale) {
            scaled = true;
            this.cube.scales.x = scale;
            this.cube.draw();

        },
        y : function (scale) {
            scaled = true;
            this.cube.scales.y = scale;
            this.cube.draw();
        },
        z : function (scale) {
            scaled = true;
            this.cube.scales.z = scale;
            this.cube.draw();
        }
    };

    var animated = undefined;
    var enabled = false;
    this.animate = function () {
        var self = this;

        if (!enabled) {
            animated = setInterval(function () {

                if(!self.animateAnAxis.value)
                {
                    self.rotate(self.angles.animate, self.angles.animate, self.angles.animate);
                    self.angles.animate++;
                }
                else
                {
                    switch(self.animateAnAxis.axis)
                    {
                        case 'x':
                            self.rotate(self.angles.animate, undefined, undefined);
                            break;
                        case 'y':
                            self.rotate(undefined, self.angles.animate, undefined);
                            break;
                        case 'z':
                            self.rotate(undefined, undefined, self.angles.animate);
                    }
                    self.angles.animate++;
                }
            }, this.animatespeed);
            enabled = true;
        }
        else {
            enabled = false;
            clearInterval(animated);
        }
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

    this.move = function(x,y,z)
    {
        this.center = new Point3D(x,y,z);
        moved = true;
    };

    //{0:[255,255,255,1],[0:[255,255,255,1]]}

    this.setColors = function (colors) {
        for(var face in colors)
        {
            if(this.faces[face])
            {
                if(colors[face].length == 4)
                {
                    this.colors[face].opacity = colors[face].pop();
                    this.colors[face].color =  colors[face];
                }
            }
        }
        this.draw();
    };

    this.translationX = function(value)
    {
        this.translations.x = value;
        this.draw();
    };

    function processScale(vertices) {
        var scaledVertices = new Array();

        for (i = 0; i < vertices.length; i++) {

            var r = vertices[i];

            if (!this.scaleTwoFaces) {

                if (this.faces[this.scaleFaces.z.active].contains(i)) {
                    r = r.scale(1, 1, this.scales.z)
                }

                if (this.faces[this.scaleFaces.x.active].contains(i)) {
                    r = r.scale(this.scales.x, 1, 1)
                }

                if (this.faces[this.scaleFaces.y.active].contains(i)) {
                    r = r.scale(1, this.scales.y, 1)
                }

            }
            else {
                r = r.scale(this.scales.x, this.scales.y, this.scales.z);
            }
            scaledVertices.push(r);
        }
        return scaledVertices;
    }

    var coisa = 0;

    function processRotation(scaledVertices,center) {
        var rotatedVertices = new Array();
        var dif = new Point3D(0, 0, 0);

        if (scaled && !this.scaleTwoFaces) {
            for (i = 0; i < scaledVertices.length; i++) {
                var r = scaledVertices[i];


                r = r.arbitraryrotateX(center, this.angles.x).arbitraryrotateY(center, this.angles.y).arbitraryrotateZ(center, this.angles.z);

                if (i == this.fixedVertice[this.scaleFaces.z.active][this.scaleFaces.y.active][this.scaleFaces.x.active] && !lastposition.equals(r)) {  //vertice fixo ao escalar
                    if (!this.scaleFaces.changedConfiguration)
                        dif = new Point3D(lastposition.x - r.x, lastposition.y - r.y, lastposition.z - r.z)
                }

                rotatedVertices.push(r);
            }
        }
        else {


            for (i = 0; i < scaledVertices.length; i++) {
                var r = scaledVertices[i];
                r = r.translate(lastCenter.x - center.x, lastCenter.y - center.y, lastCenter.z - center.z);  //muda a posicao do centro para girar em torno de si mesmo
                switch(lastAngleChange.actual)
                {
                    case 'x':
                        r = r.arbitraryrotateX(lastCenter, this.angles.x).arbitraryrotateY(lastCenter, this.angles.y).arbitraryrotateZ(lastCenter, this.angles.z);
                        break;
                    case 'y':
                        r = r.arbitraryrotateY(lastCenter, this.angles.y).arbitraryrotateZ(lastCenter, this.angles.z).arbitraryrotateX(lastCenter, this.angles.x);
                        break;
                    case 'z':
                        r = r.arbitraryrotateZ(lastCenter, this.angles.z).arbitraryrotateX(lastCenter, this.angles.x).arbitraryrotateY(lastCenter, this.angles.y);
                }

                rotatedVertices.push(r);
            }

            lastAngleChange.last = lastAngleChange.actual;

        }
        return {rotatedVertices:rotatedVertices, dif:dif};
    }

    function processTranslation(rotatedVertices, dif) {
        var t = new Array();
        var translatedVertices = new Array();
        this.actualVertices = new Array();

        for (i = 0; i < rotatedVertices.length; i++) {
            r = rotatedVertices[i];
            if (scaled && !this.scaleTwoFaces)
                r = r.translate(dif.x, dif.y, dif.z); //ajusta para que vertice fixo fique na sua posicao

            if (i == this.fixedVertice[this.scaleFaces.z.active][this.scaleFaces.y.active][this.scaleFaces.x.active]) {
                lastposition = r;
            }

            var p = r.project(this.width, this.height, this.zoom, this.viewDistance);
            t.push(p);
            translatedVertices.push(r);
            this.actualVertices.push(r);
        }

        calculateFaceCenters.call(this);
        return {translatedVertices:translatedVertices,t:t};
    }

    function calculateFaceCenters() {
        for (i = 0; i < this.faces.length; i++) {
            this.actualFaces[i] = new Point3D((this.actualVertices[this.faces[i][0]].x + this.actualVertices[this.faces[i][2]].x) / 2, (this.actualVertices[this.faces[i][0]].y + this.actualVertices[this.faces[i][2]].y) / 2, (this.actualVertices[0].z + this.actualVertices[2].z) / 2);
        }
    }

    function processVertices(vertices) {

        if (vertices === undefined)
            vertices = this.vertices;

        var scaledVertices;
        scaledVertices = processScale.apply(this, [vertices]);

        var center = new Point3D((scaledVertices[0].x + scaledVertices[6].x) / 2, (scaledVertices[0].y + scaledVertices[6].y) / 2, (scaledVertices[0].z + scaledVertices[6].z) / 2);

        var __ret = processRotation.apply(this, [scaledVertices, center]);
        var rotatedVertices = __ret.rotatedVertices;
        var dif = __ret.dif;

        var __ret_tranlataion = processTranslation.apply(this,[rotatedVertices, dif]);
        var translatedVertices = __ret_tranlataion.translatedVertices;
        var t = __ret_tranlataion.t;

        if (scaled)
            lastCenter = new Point3D((translatedVertices[0].x + translatedVertices[6].x) / 2, (translatedVertices[0].y + translatedVertices[6].y) / 2, (translatedVertices[0].z + translatedVertices[6].z) / 2);

        scaled = false;
        moved = false;
        rotated = false;
        return t;
    }
}