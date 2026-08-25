const API_URL =
"https://script.google.com/macros/s/AKfycbzCMY46Pg2NywlrIsikF7EcyGfmofgq0H3sDBLkvc6xyZ6OZM6Ti_jJ3Y8ex9lCiGRQ/exec";



// โหลด Dropdown

async function loadData(){


try{


const res =
await fetch(
API_URL+
"?action=getDropdownData"
);



const json =
await res.json();


const data =
json.data;



fillSelect(
"authority",
data.authority
);


fillSelect(
"horizon",
data.horizon
);


fillSelect(
"attitude",
data.attitude
);


fillSelect(
"action",
data.action
);



fillCheckbox(
"need",
data.need
);


fillCheckbox(
"risk",
data.risk
);



}

catch(e){

alert(
"โหลดข้อมูล dropdown ไม่สำเร็จ : "
+e.message
);


}


}





function fillSelect(id,list){


const el =
document.getElementById(id);



(list||[]).forEach(x=>{


let op =
document.createElement("option");


op.value=x;

op.textContent=x;


el.appendChild(op);


});


}







function fillCheckbox(id,list){


const box =
document.getElementById(id);



(list||[]).forEach(x=>{


box.innerHTML +=

`

<div class="checkbox">

<label>

<input 
type="checkbox"
value="${x}">

${x}

</label>

</div>

`;



});


}





function getChecked(id){


return [

...document.querySelectorAll(
"#"+id+" input:checked"
)

]

.map(x=>x.value)

.join(",");


}





async function analyze(){


const params =
new URLSearchParams({


action:"preview",


age:
document.getElementById("age").value,


income:
document.getElementById("income").value,


budget:
document.getElementById("budget").value,


authority:
document.getElementById("authority").value,


need:
getChecked("need"),


horizon:
document.getElementById("horizon").value,


attitude:
document.getElementById("attitude").value,


risk:
getChecked("risk"),


plan_action:
document.getElementById("action").value



});




const res =
await fetch(
API_URL+
"?"
+
params
);



const data =
await res.json();



showResult(data);


}







function showResult(data){



document
.getElementById("result")
.style.display="block";



document
.getElementById("stars")
.innerHTML =
data.stars;



document
.getElementById("product")
.innerHTML =
data.recommended_product;



document
.getElementById("status")
.innerHTML =
data.suitability;



document
.getElementById("score")
.innerHTML =
data.score;




document
.getElementById("tags")
.innerHTML =


(data.customer_tags||[])

.map(
x=>

`
<span class="tag">
#${x}
</span>

`

)

.join("");





document
.getElementById("summary")
.innerHTML =


(data.product_summary||[])

.map(
x=>

`
<li>${x}</li>

`

)

.join("");






document
.getElementById("ranking")
.innerHTML =


(data.ranked_products||[])

.map(

x=>

`

<div class="rank ${x.stars==="⭐⭐⭐"?"best":""}">


${x.stars}

<b>
${x.product_name}
</b>


<br>

คะแนน:
${x.score}


</div>

`

)

.join("");



}





loadData();
