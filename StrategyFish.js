var StrategyPool=[Strategy1, Strategy2, Strategy3, Strategy5, Strategy5];
const myEvent = new Event('poke');  // 定制一个消息事件，存为公共变量，用于平台授权小鱼走一次

function StartGame() {
    document.onkeydown = mykb; //挂载键盘处理，控制
    Strategy2("f2");
    // const f = document.getElementById("f2");
    // var cnt=0;
    // f.addEventListener('poke', StrategyPool[1]); //可以
    // var mytimer = setInterval(function(){
    //     f.dispatchEvent(myEvent);
    //     cnt +=1;
    //     if (cnt > 300) clearInterval(mytimer); // 关闭这个自动定时调用
    //     // console.log("one")
    // }, 1000);
}



function Strategy1() { //这里e是鼠标点击事件，e.target是点击目标，实际点击时往往是最底层元素，所以用this更好。
    let x = Math.round(Math.random()*4-2);
    let y = Math.round(Math.random()*4-2);
    let a = Math.round(Math.random()*3)*90;
    MoveFish(this.id, a, 2);
    // console.log("e.target.id" + e.target.id);
}

var bigxy;
var myset;
function Strategy2(id) { //找出所有物体离我的距离|x-x1|+|y-y1|，再根据power和朝向计算实用距离，去吃最近的一个
    FillinBigxy(id);
    var ox=allinfo[id].x; //小鱼的坐标
    var oy=allinfo[id].y;
    myset = new Set();
    let searchDistance = Math.max(allinfo[id].x, allinfo[id].y, rightEdge-allinfo[id].x, bottomEdge-allinfo[id].y);
    for (let i=1; i<searchDistance; i++) { //以小鱼为中心向外蔓延，最多蔓延5层
        for (let a=0; a<360; a+=90) { //遍历4个方向
            let ocos = Math.round(Math.cos(a*Math.PI/180));
            let osin = Math.round(Math.sin(a*Math.PI/180)); //改变符号，与坐标体系匹配，下大上小
            for (let k=0; k<=i; k++) { //每条边走2*i
                let x = ox + i*ocos + k*osin;
                let y=oy+i*osin+k*ocos;
                if (x>0 && x<=rightEdge && y>0 && y<=bottomEdge) RefreshPath( id,x,y); //先蔓延到最近点 再增大

                x = ox+i*ocos-k*osin;
                y=oy+i*osin-k*ocos;
                if (x>0 && x<=rightEdge && y>0 && y<=bottomEdge) RefreshPath( id,x,y); //先蔓延到最近点 再减小
            }
        }
        // alert("完成了一圈！")
    }
    var sum=99999, sum2=99999,fx,fy;
    for (let i of myset) { //本循环找出最近的食物，距离为sum，
        let y=parseInt(i/10000);
        let x=i%10000;
        RefreshPath(id, x-1, y);
        RefreshPath(id, x, y-1);
        RefreshPath(id, x+1, y);
        RefreshPath(id, x, y+1);
        RefreshPath(id, x, y); //将小鱼、食物的路径再次刷新，以保证迂回路径可达
        if ((sum>bigxy[y][x].sum) || (sum == bigxy[y][x].sum && sum2>bigxy[y][x].sum2 )) {
            sum = bigxy[y][x].sum;
            fx = x; //这就是最近的食物！！！地址为fx，fy
            fy = y;
        }
        // testcircle(element.x, element.y);
    }

    if (sum != 99999) {
        do {
            testcircle(fx,fy);
            let xx =bigxy[fy][fx].x; //暂存x以保证bigxy参数稳定
            fy=bigxy[fy][fx].y;
            fx=xx;
        } while (fx!=allinfo[id].x || fy!= allinfo[id].y);
    }

}

function RefreshPath(id, ox, oy) { //更新坐标（x,y)到id点的最短路径，从4个方向寻找最短路径，并记录路径数组
    console.log(ox, oy);
    if (bigxy[oy][ox] == null)    bigxy[oy][ox]={sum:99999, sum2:99999,x:0,y:0}; //默认路径很长、转折点很多，必须在此赋值，否则不能增加属性
    else { //不管是空或者有数据，均初始化
        bigxy[oy][ox]["sum"]=99999;
        bigxy[oy][ox]["sum2"]=99999;
        bigxy[oy][ox]["x"]=99999;
        bigxy[oy][ox]["y"]=99999;
        if("o" in bigxy[oy][ox]) { if (!myset.has(oy*10000+ox))myset.add(oy*10000+ox);} //将所有邻近的小鱼食物均压栈，以后再次刷新其路径
    }
    if (ox < 1 || ox > rightEdge || oy<1 || oy>bottomEdge) return;//越界直接返回，但bigxy数组比边界大2格，上面无问题
    for (let a=0; a<360; a+=90) {
        let x = ox + Math.round(Math.cos(a*Math.PI/180));
        let y = oy + Math.round(Math.sin(a*Math.PI/180)); 
        if ("o" in bigxy[oy][ox]) {
            if (bigxy[oy][ox].o.power < allinfo[id].power - EAT_HEAD) AccessNode(ox,oy,x,y);
            else if ((bigxy[oy][ox].o.power < allinfo[id].power - EAT_SIDE) && (Math.abs(a-bigxy[oy][ox].o.a) != 0)) AccessNode(ox,oy,x,y);
            else if ((bigxy[oy][ox].o.power < allinfo[id].power) && (Math.abs(a-bigxy[oy][ox].o.a) == 180)) AccessNode(ox,oy,x,y);
        } else AccessNode(ox,oy,x,y);
    }
}

function AccessNode(ox,oy,x,y) { //导入一个邻居节点的信息
    if (bigxy[y][x] == null) return;  //该邻居无数据，则直接返回
    if (!("sum" in bigxy[y][x])) return; //
     //若该邻居节点有路径
    if ((bigxy[oy][ox].sum > bigxy[y][x].sum) || (bigxy[oy][ox].sum == bigxy[y][x].sum && bigxy[oy][ox].sum2>bigxy[y][x].sum2 )) {////有更短路径就采用 或 长度相同但转折点少一些
        bigxy[oy][ox].sum = bigxy[y][x].sum+1;
        if ("x" in bigxy[y][x]) { //该邻接点不是小鱼，所以它还有上级节点
            if (bigxy[y][x].x==ox || bigxy[y][x].y==oy)     bigxy[oy][ox].sum2 = bigxy[y][x].sum2; // 同行或者同列，则不增加转折点
            else bigxy[oy][ox].sum2 = bigxy[y][x].sum2+1; // 增加一个转折点
        } else bigxy[oy][ox].sum2 = 0; //（x,y)就是小鱼本身，所以转折点数为0
        bigxy[oy][ox].x = x; //保存上级节点
        bigxy[oy][ox].y = y;
    }
}

function testcircle(x,y) {
    let c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", x*50+25);
    c.setAttribute("cy", y*50+25);
    c.setAttribute("r", "15");
    c.setAttribute("fill", "yellow");
    document.getElementById("main").appendChild(c); //直接附着在main svg上
}

function FillinBigxy(id) { //将小鱼食物等全部放入大二维数组中 var bigxy; //全体坐标中每个点。
    bigxy = new Array(bottomEdge+2);// length=edge+2，所以bigxy的元素编号范围为0-（edge+1）,实际存在小鱼的坐标为 1 - edge
    for (let i=0; i<bigxy.length; i++){
        bigxy[i]=new Array(rightEdge+2);
    }
    for ( let i in allinfo) {
        bigxy[allinfo[i].y][allinfo[i].x] = {o:allinfo[i]};  // 将小鱼、食物均放进大二维数组
    }
    bigxy[allinfo[id].y][allinfo[id].x]["sum"] =0; //, sum2:0,x:0, y:0}; //线段数、转折点书、上级路径
    bigxy[allinfo[id].y][allinfo[id].x]["sum2"] =0; 
    // bigxy[allinfo[id].y][allinfo[id].x]["x"] =0; 
    // bigxy[allinfo[id].y][allinfo[id].x]["y"] =0; 
}



function Strategy3() {  // 四个方向扫描目标，优先靠近食物、其次空无的方向，再次peer的方向，最次危险的方向
    // var obj, dist=999999;
    // for (let i=0; i<360; i+=90;) { //四个方向扫描
    //     var o = WhatsinThisway(id, i);
    //     if (o.dist < dist) { //发现一个更好的目标
    //         obj = o;    //锁定这个目标
    //         dist = o.dist; //记录下这个目标的距离：食物的距离就是捕食的格子数，空无方向固定为1000，邻近peer的方向固定为2000，邻近威胁的方向固定为3000，
    //         a = i; //记录下这个目标的方向
    //     }
    // }
    // if (obj.dist > 999 ) MoveFish(this.id, a, 1); //四方都没有食物，就朝相对最好的方向挪动一格
    // else { //有食物为obj
    //     if (obj.r==0 || obj.r<obj.dist-1) { //可以直线吃 或者 需要靠近后再绕，那就先尽快靠近
    //         MoveFish(this.id, a, Math.min(allinfo[this.id].step, obj.dist)); //尽快游过去
    //     } else MoveFish(this.id, a+90, 1); //开始绕第一步        
    //     lastObj.id=obj.id; //保存目标，下次继续
    //     lastObj.x=obj.x;
    //     lastObj.y=obj.y;
    //     lastObj.a=obj.a;
    //     lastObj.dist=
    // }
    
    // if (obj.r == 5*allinfo[this.id].step-1) { //需要绕到最远端去吃回来
    //     if (obj.dist == obj.r+1) { //已经紧邻着食物，直接开始绕,需要绕行的距离为（5n-1）+1，其实就是5n，即obj.r+1
            
    //     } else {
    //         MoveFish(this.id, a, Math.min(allinfo[this.id].step, obj.dist-obj.r-1)); //先尽量直线靠近
    //     }
    // }
    
    // WhatsinXY(x,y)
}

//     // 检测到目标后的处理方法，绕到侧端多2格，绕个远端多4格
//     //     角度差
//     //  180    |  后-1+4?5n 侧-1+3n o       // n=小鱼.step，虽然只需1格，但因为需要拐弯，机会成本n格
//     //  90/270 |  侧-1+3n   o       o
//     //  0      |   o        o       o
//     //         ————————————————————————武力值差异
//     //             >0       >5      >10
// function WhatsinThisway(id, a) {
//     var obj, i=0, objr={dist:123456, o:{}, r:0}; //objr.dist=迟到食物的格数，.o=目标，.r=总格数中需要绕的格数
//     ocos = Math.cos(a*Math.PI/180);
//     osin = Math.sin(a*Math.PI/180);
//     do {
//         i++; //距离增加1格
//         obj = WhatsinXY(allinfo[id].x+ocos*i, allinfo[id].y+osin*i);  //是属性非svg
//     } while (obj=="available"); //直到碰到边界或物体才退出
//     objr.o = obj;
//     if (obj == "out") objr.dist=1000;  //碰到边界返回1000
//     else if (obj.power > allinfo[id].power) objr.dist=3000;  //有威胁邻近，返回3000
//     else if (obj.power == allinfo[id].power) objr.dist=2000;  //邻近peer, 返回2000
//     else  { //obj是个食物
//         if (obj.power < allinfo[id].power-EAT_HEAD ){ //obj是一个最弱的食物
//             objr.dist = i;
//         } else if (obj.power < allinfo[id].power-EAT_SIDE) { // obj可从侧面/尾部等3面吃
//             if (Math.abs(obj.a-allinfo[id].a) == 180) obj.dist = i -1 + 3*allinfo[id].step; //它正对着我，绕到侧面可以吃它，增加2格
//             else objr.dist = i; //它不是正对着我，可以直接吃掉它
//         } else { // obj只能从尾部一面吃
//             if (Math.abs(obj.a-allinfo[id].a) == 0) obj.dist =i; //正好obj的尾部朝向我，可以直接吃
//             else if (Math.abs(obj.a-allinfo[id].a)==180) obj.dist = i-1 + (allinfo[id].step>1? 4:5)*allinfo[id].step; //obj的头朝我，要绕到它的背后，增加4格
//             else obj.dist = i-1+3*allinfo[id].step; //obj的侧面朝我，绕2格到其尾部即可吃它。
//         }
//         obj.r = obj.dist - i; //如果需要绕行，在这里标注绕行的格子等价数
//     }
//     return objr;
// }

function Strategy4() { 

}

function Strategy5() { 

}
