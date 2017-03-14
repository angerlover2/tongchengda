
//首页寄件地址
$("#fo1").click(function(){
	$(".message [type='text']").val("");
	$(".form").addClass("jijian").removeClass("shoujian");
	$(".message").find(".who").attr("placeholder","寄件人名字");
	$(".message").show();
	$(".message").find("#address").attr("local","from");
});

//首页收件地址
$("#to2").click(function(){
	$(".message input[type='text']").val("");
	$(".form").addClass("shoujian").removeClass("jijian");
	$(".message").find(".who").attr("placeholder","收件人名字");
	$(".message").show();
	$(".message").find("#address").attr("local","to");
});

//地址层弹出
$(document).on('click','.open-about', function(){
  $.popup('.popup-about');
});


var city;//当前城市
var fromLocation;//目前地点
var toLocation;//去往地点
var distance;  //距离 
//根据当前ip确定所在城市
$.ajax({
	url:"http://api.map.baidu.com/location/ip?ak=UKcw6OUqYS7HrwAbEiinsHKv&coor=bd09ll",
	dataType:"jsonp",
	success:function(msg){
		city=msg.content.address;
	}
});

//模糊搜索地址，并自定义经纬度属性
$('#address').bind('input ', function() {  
	$("#r-result ul").html("");
	$.ajax({
		url:"http://api.map.baidu.com/place/v2/search?&page_size=20&output=json&ak=UKcw6OUqYS7HrwAbEiinsHKv",
		data:{
			query:$("#address").val(),
			region:city
		},
		dataType:"jsonp",
		success:function(msg){
			//console.log(msg.results)
			var html="";
			if(msg.results.length>0){
				for(var i in msg.results){
					if(msg.results[i].address){
						var nowLocation=msg.results[i].location.lat+","+msg.results[i].location.lng;
						html +="<li location='"+nowLocation+"'><span>"+msg.results[i].name+"</span><p>"+msg.results[i].address+"</p></li>";	
					}
				}
				$("#r-result ul").append(html);
			}else{
				html="<div><p style='color:red'>您输入的地址定位失败，</p><p style='color:red'>建议输入小区、大厦或街道门牌号。</p></div>"
				$("#r-result ul").append(html);
			}
			
		}
	});
});

//点击搜索结果列表，获取住址及坐标
$("#r-result ul").on("click","li",function(){
	var adds=$(this).find("span").text()+"("+$(this).find("p").eq(0).text()+")";
	$("#address").val(adds);
	$("#r-result ul").html("");
	if($("#address").attr("local")=="from"){
		fromLocation=$(this).attr("location");
	}else{
		toLocation=$(this).attr("location");
	}
	
});



var jName,jPhone,jAddress,jFloor;//寄件人信息
var sName,sPhone,sAddress,sFloor;//收件人信息
//寄收件地址弹出层 地址提交
$(".ok").click(function(){
	//判断当前弹出层是寄件还是收件地址，并将地址填入首页地址栏
	if($("#address").attr("local")=="from"){
		if($("#address").val()!="" && $(".who").val()!="" && $("#jphone").val()!=""){           //如果有输入地址
			$("#fo1 input").val($("#address").val());
			jName=$(".who").val();
			jPhone=$("#jphone").val();
			jAddress=$("#address").val();
			jFloor=$("#floor").val();
			
			$.closeModal();
		}else{
			$.toast("请输入详细信息！");
		}
	}else{
		if($("#address").val()!="" && $(".who").val()!="" && $("#jphone").val()!=""){
			$("#to2 input").val($("#address").val());
			sName=$(".who").val();
			sPhone=$("#jphone").val();
			sAddress=$("#address").val();
			sFloor=$("#floor").val();
			$.closeModal();
		}else{
			$.toast("请输入详细信息！");
		}
	}
	//若寄收件地址均不为空，计算总价
	if($("#from01").val()!="" && $("#to02").val()!=""){
		computed();
	}
	
	
});



//寄收件地址弹出层 关闭按钮
$(".close").click(function(){
	$.closeModal();
});

//计算距离，请求成功调用计算总价方法
function computed(){
	$.ajax({
		url:"http://api.map.baidu.com/routematrix/v2/driving?output=json&ak=UKcw6OUqYS7HrwAbEiinsHKv",
		dataType:"jsonp",
		data:{
			origins:fromLocation,
			destinations:toLocation
		},
		success:function(msg){
		
			console.log(msg.result[0].distance);
			distance=msg.result[0].distance.text+"";
			if(distance.indexOf("米")>0){
				distance=parseFloat(distance)*0.001;
			}else{
				distance=parseFloat(distance);
			}
			console.log(distance+"公里");
			toatle(distance,weight);              
		}
	})
};


//计算总价       n计算好的距离，w重量
function toatle(n,w){
	var distance=n;
	var Price=16;
	var total=0;
	weight=w;
	var totalPrice;
	if(weight<5 && distance<5){
		if(weight>5 && weight<20){
			total=total+(weight-5)*2;
		}else if(weight>=20){
			total=total+(weight-20)*5;
		}
	}else if(distance>=5 && distance<=20){
		total=(distance-5)/5*8;   
		if(weight>=5 && weight<=20){
			total=total+(weight-5)*2;
		}else if(weight>20){
			total=total+(weight-20)*5;
		}
	}else if(distance>20){
		if(weight>=5 && weight<=20){
			total=total+(weight-5)*2;
		}else if(weight>20){
			total=total+(weight-20)*5;
		}
		total=total+((distance-20)/5)*10;
	}else if( weight>=5 && weight<=20 ){
		total=total+(weight-5)*2;
	}else if(weight>20){
		total=total+(weight-20)*5;
	}
	var tPrice=Price+total;
	totalPrice=tPrice.toFixed(2);
	console.log(totalPrice+"元"+"<br>"+tPrice+"/元");
	$(".bar-tab .fl .totalPrice").text(totalPrice);
};

//重量弹出层效果
$("#weight").picker({
  toolbarTemplate: '<header class="bar bar-nav">\
  <button class="button button-link pull-right close-picker2 lightyellow" onclick="closePicker()">确定</button>\
  <h1 class="title">物品重量</h1>\
  </header>',
  cols: [
    {
      textAlign: 'center',
      values: [' <5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30'  ]
    }
  ]
});


//重量改变计算总价
var weight;
function closePicker(){
	weight=$("#weight").val();	
	if($("#form01").val()!="" && $("#to02").val()!=""){
		toatle(distance,weight);
	}
	$.closeModal(".picker-modal.modal-in"); 
};


//收取时间效果
$("#getTime").picker({
  toolbarTemplate: '<header class="bar bar-nav">\
  <button class="button button-link pull-right close-picker lightyellow">确定</button>\
  <h1 class="title">取件时间</h1>\
  </header>',
  cols: [
    {
      textAlign: 'center',
      values: ['今天','明天']
    },
    {
      textAlign: 'center',
      values: ['01点','02点','03点','04点','05点','06点','07点','08点','09点','10点','11点','12点','13点','14点','15点','16点','17点','18点','19点','20点','21点','22点','23点','24点']
    },
    {
      textAlign: 'center',
      values: ["0分", "1分", "2分", "3分", "4分", "5分", "6分", "7分", "8分", "9分", "10分", "11分", "12分", "13分", "14分", "15分", "16分", "17分", "18分", "19分", "20分", "21分", "22分", "23分", "24分", "25分", "26分", "27分", "28分", "29分", "30分", "31分", "32分", "33分", "34分", "35分", "36分", "37分", "38分", "39分", "40分", "41分", "42分", "43分", "44分", "45分", "46分", "47分", "48分", "49分", "50分", "51分", "52分", "53分", "54分", "55分", "56分", "57分", "58分", "59分"]
    }
  ]
});


//付款方式效果
$("#payWay").picker({
  toolbarTemplate: '<header class="bar bar-nav">\
  <button class="button button-link pull-right close-picker lightyellow">确定</button>\
  <h1 class="title">付款方式</h1>\
  </header>',
  cols: [
    {
      textAlign: 'center',
      values: ['到付','寄付现结']
    }
  ]
});

//提交订单
$(".send").click(function(){
	
	if($("#from01").val()!="" && $("#to02").val()!=""){
		console.log("寄件人姓名"+jName+"寄件人电话"+jPhone+"寄件人地址"+jAddress+jFloor);
		console.log("收件人姓名"+sName+"收件人电话"+sPhone+"收件人地址"+sAddress+sFloor);
		console.log($("#getTime").val());
		console.log($("#payWay").val());
	}else{
		$.toast("请输入相关信息!");
	}

});

		