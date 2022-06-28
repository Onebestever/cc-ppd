

const check = document.getElementsByClassName("fa-star");//UPDATE BUTTON
const trash = document.getElementsByClassName("fa-trash");//DELETE BUTTON
console.log('hello')

Array.from(check).forEach(function(element) {
    element.addEventListener('click', function(){
      let isItStarred = element.dataset.todostarred
      console.log(isItStarred)
      const toDoId = element.dataset.todoid
    

      let myBool = (isItStarred.toLowerCase() === 'true'); 
      console.log(typeof myBool)
     
        fetch('crossedOutToDo', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'isStarred': myBool,
            'id': toDoId
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          //console.log(data)
          window.location.reload(true)
        })     
    });
});
 
Array.from(trash).forEach(function(element) {
  const toDoId = element.dataset.todoid
  element.addEventListener('click', function(){
    fetch('deleteTask', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'id': toDoId
      })
    }).then(function (response) {
      window.location.reload()
    })
  });
});

function alertMsg() {
  alert("Are you sure you want to delete this? If so click the trash button again!");
}
