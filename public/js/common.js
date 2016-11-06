$(document).ready(function() {

  $( "#datepicker" ).datepicker({
      changegenderMonth: true,
      changeYear: true
  });


  $('#submitForm').on('click', function(){
    var jsonToSend = getJSON();
    console.log(getJSON());

    $.ajax({
      url: '/new_entry',
      data : JSON.stringify(jsonToSend),
      contentType : 'application/json',
      type : 'POST',
      success: function(message) {
        console.log('success');
        console.log(message);
        updateResponse(message.message);
      },
      error: function(jqXHR, status) {
        console.log('error');
        console.log(jqXHR);
        console.log(status);
      }
    });
  });

});

function updateResponse(response) {
  $('#response').css('visibility', 'visible');
  $('#response').html(response);
}

function getJSON() {
  var jsonReq;
  var firstName = $(".fname").val();
  var lastName = $(".lname").val();
  var gender;

  $(".radio-div input[type=radio]").each(function() {
    if($(this).is("checked") === true){
      gender = $(this).attr("value");
    }
  });

  var drug = $(".select-drug").val();
  var dob = $("#datepicker").val();
  var user = $('#doctor').val();
  var contact = $('#contact').val();
  jsonReq = {
    firstName: firstName,
    lastName: lastName,
    drug: drug,
    dob: dob,
    gender: gender,
    user: user,
    contact: contact
  };
  return jsonReq;
}
