// // const thumbUp = document.getElementsByClassName("fa-thumbs-up");
const star = document.getElementsByClassName("fa-star-o");
const trash = document.getElementsByClassName("fa-trash-o");

// const addCareBtn = document.getElementsByClassName('addCareBtn')

// const seeCareBtn = document.getElementsByClassName('seeCareBtn')

// const updateForm = document.getElementsByClassName('updateForm')
// const plantMain = document.getElementsByClassName('plantMain')

Array.from(star).forEach(function(element) {
    element.addEventListener('click', function(){
  
      const postObjectID = this.parentNode.parentNode.parentNode.id
      //console.log(`this ${postObjectID}`)
      const star = this.parentNode.parentNode.id

      console.log('this',postObjectID)
      
      if(star == 'true'){
        
        fetch('removeStarred', {
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
      
      }else if (star == 'false'){
         
        fetch('addStarred', {
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
      const postObjectID = this.parentNode.parentNode.parentNode.id
  
      fetch('deleteWorkoutPost', {
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
  

// // Array.from(thumbUp).forEach(function(element) {
// //       element.addEventListener('click', function(){
// //         const name = this.parentNode.parentNode.childNodes[1].innerText
// //         const msg = this.parentNode.parentNode.childNodes[3].innerText
// //         const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[5].innerText)
// //         fetch('messages', {
// //           method: 'put',
// //           headers: {'Content-Type': 'application/json'},
// //           body: JSON.stringify({
// //             'name': name,
// //             'msg': msg,
// //             'thumbUp':thumbUp
// //           })
// //         })
// //         .then(response => {
// //           if (response.ok) return response.json()
// //         })
// //         .then(data => {
// //           console.log(data)
// //           window.location.reload(true)
// //         })
// //       });
// // });

// // Array.from(thumbDown).forEach(function(element) {
// //   element.addEventListener('click', function(){
// //     const name = this.parentNode.parentNode.childNodes[1].innerText
// //     const msg = this.parentNode.parentNode.childNodes[3].innerText
// //     const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[5].innerText)
// //     fetch('messagesTDown', {
// //       method: 'put',
// //       headers: {'Content-Type': 'application/json'},
// //       body: JSON.stringify({
// //         'name': name,
// //         'msg': msg,
// //         'thumbUp':thumbUp
// //       })
// //     })
// //     .then(response => {
// //       if (response.ok) return response.json()
// //     })
// //     .then(data => {
// //       console.log(data)
// //       window.location.reload(true)
// //     })
// //   });
// // });


// Array.from(trash).forEach(function(element) {
//       element.addEventListener('click', function(){
//         // const plantName = this.parentNode.parentNode.childNodes[1].innerText
//         // const date = this.parentNode.parentNode.childNodes[3].innerText
//         const theID = this.parentNode.parentNode.parentNode.id
//         // console.log(plantName, date, theID)

//         fetch('deletePlant', {
//           method: 'delete',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//             'theID': theID
//           })
//         }).then(function (response) {
//           window.location.reload()
//         })
//       });
// });
