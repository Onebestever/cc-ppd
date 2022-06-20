const addButton = document.querySelector(".addPerson"); //button to add person to relationship array

// add a smurf so when you click the email value from the input 
addButton.addEventListener('click', function () {
  const email = document.querySelector("#email").value; //input
  let myObject = {'email': email}
console.log(email)
  fetch('searchAddUser', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(myObject)
    }).then(response => {
      if (response.ok) return response.json()
    })
    .then(data => {
      console.log('YOU SHOULD SEE THIS ',data)
      location.reload()
    })
});

const check = document.getElementsByClassName("fa-star");//UPDATE BUTTON
const trash = document.getElementsByClassName("fa-trash");//DELETE BUTTON

Array.from(check).forEach(function(element) {
    element.addEventListener('click', function(){
  
      const emailIndex = this.parentNode.parentNode.childNodes[7].innerHTML
      const check = this.parentNode.parentNode.childNodes[3].innerHTML
      console.log(emailIndex)
      //console.log(`this ${postObjectID}`)
      // console.log('check complete?', check)
      // console.log('this',postObjectID)
      
      if(check == 'true'){
        fetch('removeUser', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'postObjectID': postObjectID
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          //console.log(data)
          window.location.reload(true)
        })     
      }else if (check == 'false'){
        fetch('addUser', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'postObjectID': postObjectID
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      }
    });
});
 
Array.from(trash).forEach(function(element) {
  element.addEventListener('click', function(){
    const postObjectID = this.parentNode.parentNode.childNodes[1].innerHTML
    fetch('deleteUser', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'postObjectID':postObjectID
      })
    }).then(function (response) {
      window.location.reload()
    })
  });
});

function alertMsg() {
  alert("Are you sure you want to delete this? If so click the trash button again!");
}
