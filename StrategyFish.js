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

function Strategy2(id) { //找出所有物体离我的距离|x-x1|+|y-y1|，再根据power和朝向计算实用距离，去吃最近的一个
    let bigxy=FillinBigxy(id);
    ox=allinfo[id].x; //小鱼的坐标
    oy=allinfo[id].y;
    for (let i=1; i<6; i++) { //以小鱼为中心向外蔓延，最多蔓延5层
        for (let a=0; a<360; a+=90) { //遍历4个方向
            let ocos = Math.round(Math.cos(a*Math.PI/180));
            let osin = Math.round(Math.sin(a*Math.PI/180)); //改变符号，与坐标体系匹配，下大上小
            for (let k=0; k<2*i; k++) { //每条边走2*i
                let x = ox + i*(ocos+osin) - k*osin;
                let y = oy + i*(osin-ocos) + k*ocos;
                if (x>0 && x<=rightEdge && y>0 && y<=bottomEdge)  { //在边界之内
                    testcircle(x,y);
                }
            }
        }
        alert("完成了一圈！")
    }
}

function testcircle(x,y) {
    let c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", x*50+25);
    c.setAttribute("cy", y*50+25);
    c.setAttribute("r", "20");
    c.setAttribute("fill", "yellow");
    document.getElementById("main").appendChild(c); //直接附着在main svg上
}

function FillinBigxy(id) { //将小鱼食物等全部放入大二维数组中 var bigxy; //全体坐标中每个点。
    let bigxy = new Array(bottomEdge+1);// 
    for (let i=0; i<bigxy.length; i++){
        bigxy[i]=new Array(rightEdge+1);
    }
    for ( let i in allinfo) {
        bigxy[allinfo[i].y][allinfo[i].x] = {o:i};  // 将小鱼、食物均放进大二维数组
    }
    bigxy[allinfo[id].y][allinfo[id].x]["sum"] =0; //线段数
    bigxy[allinfo[id].y][allinfo[id].x]["sum2"] =0; //转折点数
    bigxy[allinfo[id].y][allinfo[id].x]["path"] =[{x:allinfo[id].x, y:allinfo[id].y}]; //从小鱼到本节点的最佳路径
    return bigxy;
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
