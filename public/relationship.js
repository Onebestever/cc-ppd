const addButton = document.querySelector(".addPerson"); //button


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
      console.log(data)
      window.location.reload(true)
    })
});