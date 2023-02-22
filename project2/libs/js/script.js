// loader
$(window).on("load", function () {

  if ($("#preloader").length) {
    $("#preloader")
      .delay(1000)
      .fadeOut("slow", function () {
        $(this).remove();
      });
  }

});

// keep current tab on reload
$(function() {
  $('.tab-link').on('shown.bs.tab', function (e) {
    localStorage.setItem('lastTab', $(this).attr('data-bs-target'));
  });
  var lastTab = localStorage.getItem('lastTab');

  if (lastTab) {
    $('[data-bs-target="' + lastTab + '"]').tab('show');
  }
});

// handle modals opening and closing
$('#addEmployeeModal').on('hidden.bs.modal', function () {
  $(this).find('form').trigger('reset');
})

$('#addDepartmentModal').on('hidden.bs.modal', function () {
  $(this).find('form').trigger('reset');
})

$('#addLocationModal').on('hidden.bs.modal', function () {
  $(this).find('form').trigger('reset');
})

$('#editEmployeeModal').on('show.bs.modal', function(e) {

  $('#big-delete-btn-emp').attr('value', $(e.relatedTarget).data('id'));

  $('#idEdit').attr('value', $(e.relatedTarget).data('id'));
  $('#firstFieldEdit').attr('value', $(e.relatedTarget).data('first'));
  $('#lastFieldEdit').attr('value', $(e.relatedTarget).data('last'));
  $('#emailFieldEdit').attr('value', $(e.relatedTarget).data('email'));
  $('#jobFieldEdit').attr('value', $(e.relatedTarget).data('job'));
  $('#departmentFieldEdit').val($(e.relatedTarget).data('dept-id'));
  $('#locationFieldEdit').val($(e.relatedTarget).data('location'));
});

$('#editEmployeeModal').on('hidden.bs.modal', function () {
  $(this).find('form').trigger('reset');
})

$('#editDepartmentModal').on('show.bs.modal', function(e) {

  $('#deptIdEdit').attr('value', $(e.relatedTarget).data('id'));
  $('#deptNameFieldEdit').attr('value', $(e.relatedTarget).data('department'));
  $('#deptLocationFieldEdit').val($(e.relatedTarget).data('location'));

});

$('#editDepartmentModal').on('hidden.bs.modal', function () {
  $(this).find('form').trigger('reset');
})

$('#editLocationModal').on('show.bs.modal', function(e) {

  $('#locationIdEdit').attr('value', $(e.relatedTarget).data('id'));
  $('#locationNameFieldEdit').attr('value', $(e.relatedTarget).data('location'));
});

$('#editLocationModal').on('hidden.bs.modal', function () {
  $(this).find('form').trigger('reset');
})


$("#deleteEmployeeModal").on("show.bs.modal", function(e) {

  $('#idDel').attr('value', $(e.relatedTarget).data('id'));
  $('#idDel').attr('value', $(e.relatedTarget).data('id'));
  $('#fullName').text($(e.relatedTarget).data('first') + " " + $(e.relatedTarget).data('last'));

});

$("#deleteDepartmentModal").on("show.bs.modal", function(e) {

  $('#deptIdDel').attr('value', $(e.relatedTarget).data('id'));
  $('#deptNameDel').text($(e.relatedTarget).data('department'));
  $('#deptNameError').text($(e.relatedTarget).data('department'));

  var val = $(e.relatedTarget).data('id');

  $.ajax({
    url: "libs/php/getPersonnelCount.php",
    type: "POST",
    dataType: "json",
    async: false,
    data: {
      id: val
    },
    success: function (result) {

      const data = result['data'];

      var test = data.personnel[0].pc;

      if (test != 0) {
        // alert(`${$(e.relatedTarget).data('department')} cannot be deleted because it contains at least one employee.`);
        $("#errorDepartmentModal").modal("show");
        e.preventDefault();
      }

    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    },
  })
});

$("#deleteLocationModal").on("show.bs.modal", function(e) {

  $('#locationIdDel').attr('value', $(e.relatedTarget).data('id'));
  $('#locNameDel').text($(e.relatedTarget).data('location'));
  $('#locNameError').text($(e.relatedTarget).data('location'));

  val = $(e.relatedTarget).data('id')

  $.ajax({
    url: "libs/php/getDepartmentCount.php",
    type: "POST",
    dataType: "json",
    async: false,
    data: {
      id: val
    },
    success: function (result) {

      const data = result['data'];

      var test = data.department[0].dc;

      if (test != 0) {
        // alert(`${$(e.relatedTarget).data('location')} cannot be deleted because it contains at least one department.`);
        $("#errorLocationModal").modal("show");
        e.preventDefault();
      }

    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    },
  })
});


let table = document.getElementById('employeesTable');

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
  }
}

//getAll
const getAll = function () {
  $.ajax({
    url: "libs/php/getAll.php",
    type: "POST",
    dataType: "json",
    success: function (result) {
      const data = result['data'];

      let df = document.createDocumentFragment();

      let tbody = document.createElement('tbody');

      df.appendChild(tbody);

      data.forEach(employee => {

        function checkJob() {
          if (employee.jobTitle === '') {
            return 'null';
          } else {
            return employee.jobTitle
          }
        }

        tbody.insertAdjacentHTML('beforeend',
          `<tr title="Edit" data-bs-toggle="modal" data-id="${employee.id}" data-first="${employee.firstName}" data-last="${employee.lastName}" data-email="${employee.email}" data-job="${checkJob()}" data-dept-id="${employee.deptID}" data-location="${employee.locationID}" data-bs-target="#editEmployeeModal">
          <td>${employee.lastName}</td>
          <td>${employee.firstName}</td>
          <td class="d-none d-md-table-cell">${employee.jobTitle}</td>
          <td class="d-none d-md-table-cell">${employee.email}</td>
          <td class="d-none d-md-table-cell">${employee.dept}</td>
          <td class="d-none d-lg-table-cell">${employee.location}</td>

          <td>
            <a href="#deleteEmployeeModal" class="delete" data-id="${employee.id}" data-first="${employee.firstName}" data-last="${employee.lastName}" data-bs-toggle="modal">
              <i class="fas fa-trash-alt" data-bs-toggle="tooltip" title="Delete"></i>
            </a>
          </td>
          </tr>`
          )

      });

      table.appendChild(df);

      const offsetHeight = $("#mainNav").outerHeight() + $("#navTabs").outerHeight();

      var eTable = $('#employeesTable').DataTable( {
        paging: false,
        autoWidth: true,
        sDom: 'ltipr',
        fixedHeader: {
          header: false,
          headerOffset: offsetHeight
        },
        columnDefs: [ {
          'targets': [6], /* column index [0,1,2,3]*/
          'orderable': false, /* true or false */
        }],
        bInfo: false
      })

      eTable.columns().iterator( 'column', function (ctx, idx) {
        $( eTable.column(idx).header() ).append('<span class="sort-icon"/>');
      } );

      $('#myInput').on('keyup change', function () {
        eTable.search(this.value).draw();
      });

    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    },
  });
};

getAll();

//getAllDepartments
const getAllDepartments = function () {
  $.ajax({
    url: "libs/php/getAllDepartments.php",
    type: "POST",
    dataType: "json",
    success: function (result) {
      const data = result['data'];

      let deptTable = document.getElementById('departmentsTable');

      let df = document.createDocumentFragment();

      let tbody = document.createElement('tbody');

      df.appendChild(tbody);

      data.forEach(dept => {

        $("#departmentField").append(new Option(dept.department, dept.departmentID))
        $("#departmentFieldEdit").append(new Option(dept.department, dept.departmentID))

        tbody.insertAdjacentHTML('beforeend',
          `<tr title="Edit" data-bs-toggle="modal" data-id="${dept.departmentID}" data-department="${dept.department}" data-location="${dept.locationID}" data-bs-target="#editDepartmentModal">
            <td>${dept.department}</td>
            <td>${dept.location}</td>
            <td>
              <a href="#deleteDepartmentModal" class="delete deleteDept" data-id="${dept.departmentID}" data-department="${dept.department}" data-bs-toggle="modal">
                <i class="fas fa-trash-alt" data-toggle="tooltip" title="Delete"></i>
              </a>
            </td>
          </tr>`
          )
      });

      var sel = $('#departmentField');
      var selected = sel.val();
      var opts_list = sel.find('option');
      opts_list.sort(function(a, b) { return $(a).text() > $(b).text() ? 1 : -1; });
      sel.html('').append(opts_list);
      sel.val(selected);

      var selEdit = $('#departmentFieldEdit');
      var selectedEdit = selEdit.val();
      var opts_listEdit = selEdit.find('option');
      opts_listEdit.sort(function(a, b) { return $(a).text() > $(b).text() ? 1 : -1; });
      selEdit.html('').append(opts_listEdit);
      selEdit.val(selectedEdit);

      $("#departmentField").prepend(new Option("Department", "department"));
      $("option[value='department']").attr("disabled", "disabled");
      $("option[value='department']").attr("selected", "selected");


      deptTable.appendChild(df);



      var dTable = $('#departmentsTable').DataTable( {
        paging: false,
        autoWidth: true,
        fixedHeader: {
          header: false,
          headerOffset: 92
        },
        sDom: 'ltipr',
        columnDefs: [ {
          'targets': [2], /* column index [0,1,2,3]*/
          'orderable': false, /* true or false */
        }],
        bInfo: false

      })

      dTable.columns().iterator( 'column', function (ctx, idx) {
        $( dTable.column(idx).header() ).append('<span class="sort-icon"/>');
      } );

      $('#myInput').on('keyup change', function () {
        dTable.search(this.value).draw();
      });

    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    },
  });
};

getAllDepartments();

const changeTab = function (tab) {
  $(`#${tab}-tab`).trigger('click')
}

//getAllLocations
const getAllLocations = function () {
  $.ajax({
    url: "libs/php/getAllLocations.php",
    type: "POST",
    dataType: "json",
    success: function (result) {
      const data = result['data'];

      let locationsTable = document.getElementById('locationsTable');

      let df = document.createDocumentFragment();

      let tbody = document.createElement('tbody');

      df.appendChild(tbody);

      data.forEach(location => {

        $("#locationField").append(new Option(location.name, location.id))
        $("#locationFieldEdit").append(new Option(location.name, location.id))
        $("#deptLocationFieldEdit").append(new Option(location.name, location.id))

        tbody.insertAdjacentHTML('beforeend',
          `<tr title="Edit" data-bs-toggle="modal" data-id="${location.id}" data-location="${location.name}" data-bs-target="#editLocationModal">
        <td>${location.name}</td>
        <td>
          <a href="#deleteLocationModal" class="delete" data-id="${location.id}" data-location="${location.name}" data-bs-toggle="modal">
            <i class="fas fa-trash-alt" data-bs-toggle="tooltip" title="Delete"></i>
          </a>
        </td>
        </tr>`
          )

      })

      var sel = $('#locationField');
      var selected = sel.val();
      var opts_list = sel.find('option');
      opts_list.sort(function(a, b) { return $(a).text() > $(b).text() ? 1 : -1; });
      sel.html('').append(opts_list);
      sel.val(selected);

      var selEdit = $('#locationFieldEdit');
      var selectedEdit = selEdit.val();
      var opts_listEdit = selEdit.find('option');
      opts_listEdit.sort(function(a, b) { return $(a).text() > $(b).text() ? 1 : -1; });
      selEdit.html('').append(opts_listEdit);
      selEdit.val(selectedEdit);

      var selDept = $('#deptLocationFieldEdit');
      var selectedDept = selDept.val();
      var opts_listDept = selDept.find('option');
      opts_listDept.sort(function(a, b) { return $(a).text() > $(b).text() ? 1 : -1; });
      selDept.html('').append(opts_listDept);
      selDept.val(selectedDept);

      $("#locationField").prepend(new Option("Location", "location"));
      $("option[value='location']").attr("disabled", "disabled");
      $("option[value='location']").attr("selected", "selected");

      locationsTable.appendChild(df);

      var lTable = $('#locationsTable').DataTable( {
        paging: false,
        autoWidth: true,
        fixedHeader: {
          header: false,
          headerOffset: 0
        },
        sDom: 'ltipr',
        columnDefs: [ {
          'targets': [1],
          'orderable': false,
        }],
        bInfo: false

      })

      lTable.columns().iterator( 'column', function (ctx, idx) {
        $( lTable.column(idx).header() ).append('<span class="sort-icon"/>');
      } );

      $('#myInput').on('keyup change', function () {
        lTable.search(this.value).draw();
      });

    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    },
  });
};

getAllLocations();


$("#editCheck").change(function() {
  if(this.checked) {
    $('#employeeFieldset').prop('disabled', false);
    $('#btn-update-emp').prop('disabled', false);
  } else {
    $('#employeeFieldset').prop('disabled', true);
    $('#btn-update-emp').prop('disabled', true);
  }
});

$("#deptEditCheck").change(function() {
  if(this.checked) {
    $('#departmentFieldset').prop('disabled', false);
    $('#btn-update-dept').prop('disabled', false);
  } else {
    $('#departmentFieldset').prop('disabled', true);
    $('#btn-update-dept').prop('disabled', true);
  }
});

$("#locationEditCheck").change(function() {
  if(this.checked) {
    $('#locationFieldset').prop('disabled', false);
    $('#btn-update-location').prop('disabled', false);
  } else {
    $('#locationFieldset').prop('disabled', true);
    $('#btn-update-location').prop('disabled', true);
  }
});

// insertEmployee
const insertEmployee = function () {
  $.ajax({
    url: "libs/php/insertEmployee.php",
    type: "POST",
    dataType: "json",
    data: {
      firstName: $('#firstField').val(),
      lastName: $('#lastField').val(),
      jobTitle: $('#jobField').val(),
      email: $('#emailField').val(),
      departmentID: $('#departmentField').val()
    },
    success: function (result) {
      const status = result['status'];
      console.log(status);

      if(status.code === '200') {
        console.log("employee added");
        location.reload();
      }

    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    },
  });
};

$("#employee_form").submit(function (e) {
  e.preventDefault();
  if (window.confirm("Add Employee?")) {
    insertEmployee();
  }
});

// updateEmployee
const updateEmployee = function () {
  $.ajax({
    url: "libs/php/updateEmployee.php",
    type: "POST",
    dataType: "json",
    data: {
      firstName: $('#firstFieldEdit').val(),
      lastName: $('#lastFieldEdit').val(),
      jobTitle: $('#jobFieldEdit').val(),
      email: $('#emailFieldEdit').val(),
      departmentID: $('#departmentFieldEdit').val(),
      id: $('#idEdit').val()
    },
    success: function (result) {
      const status = result['status'];

      if(status.code === '200') {
        console.log("employee updated");
        location.reload();
      }

    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    },
  });
};

$("#employee_form_edit").submit(function (e) {
  e.preventDefault();
  if (window.confirm("Update Employee?")) {
    updateEmployee();
  }
});

// deleteEmployee
const deleteEmployee = function () {
  $.ajax({
    url: "libs/php/deleteEmployee.php",
    type: "POST",
    dataType: "json",
    data: {
      id: $('#idDel').val()
    },
    success: function (result) {
      const status = result['status'];

      if(status.code === '200') {
        console.log(status.sql);
        location.reload();
      }

    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    },
  });
};

$("#employee_form_delete").submit(function (e) {
  e.preventDefault();
  deleteEmployee();
});

// insertDepartment
const insertDepartment = function () {
  $.ajax({
    url: "libs/php/insertDepartment.php",
    type: "POST",
    dataType: "json",
    data: {
      name: $('#nameField').val(),
      locationID: $('#locationField').val()
    },
    success: function (result) {
      const status = result['status'];

      if(status.code === '200') {
        console.log("dept added");
        location.reload();
      }


    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    },
  });
};

$("#department_form").submit(function (e) {
  e.preventDefault();
  if (window.confirm("Add Department?")) {
    insertDepartment();
  }
});

// updateDepartment
const updateDepartment = function () {
  $.ajax({
    url: "libs/php/updateDepartment.php",
    type: "POST",
    dataType: "json",
    data: {
      name: $('#deptNameFieldEdit').val(),
      locationID: $('#deptLocationFieldEdit').val(),
      id: $('#deptIdEdit').val()
    },
    success: function (result) {
      const status = result['status'];

      if(status.code === '200') {
        console.log("department updated");
        location.reload();
      }

    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    },
  });
};

$("#department_form_edit").submit(function (e) {
  e.preventDefault();
  if (window.confirm("Update Department?")) {
    updateDepartment();
  }
});

// deleteDepartment
const deleteDepartment = function () {
  $.ajax({
    url: "libs/php/deleteDepartment.php",
    type: "POST",
    dataType: "json",
    data: {
      id: $('#deptIdDel').val()
    },
    success: function (result) {
      const status = result['status'];

      if(status.code === '200') {
        if (status.sql) {
          alert(status.errormsg + "\n\n" + status.sql);
        } else {
          location.reload();
        }
      }

    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    },
  });
};

$("#department_form_delete").submit(function (e) {
  e.preventDefault();
  deleteDepartment();
});

// insertLocation
const insertLocation = function () {
  $.ajax({
    url: "libs/php/insertLocation.php",
    type: "POST",
    dataType: "json",
    data: {
      name: $('#locationNameField').val()
    },
    success: function (result) {
      const status = result['status'];

      if(status.code === '200') {
        console.log("location added");
        location.reload();
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    },
  });
};


$("#location_form").submit(function (e) {
  e.preventDefault();
  if (window.confirm("Add Location?")) {
    insertLocation();
  }
});

// updateLocation
const updateLocation = function () {
  $.ajax({
    url: "libs/php/updateLocation.php",
    type: "POST",
    dataType: "json",
    data: {
      name: $('#locationNameFieldEdit').val(),
      id: $('#locationIdEdit').val()
    },
    success: function (result) {
      const status = result['status'];

      if(status.code === '200') {
        console.log("location updated");
        location.reload();
      }

    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    },
  });
};

$("#location_form_edit").submit(function (e) {
  e.preventDefault();
  if (window.confirm("Update Location?")) {
    updateLocation();
  }
});

// deleteLocation
const deleteLocation = function () {
  $.ajax({
    url: "libs/php/deleteLocation.php",
    type: "POST",
    dataType: "json",
    data: {
      id: $('#locationIdDel').val()
    },
    success: function (result) {
      const status = result['status'];

      if(status.code === '200') {
        if (status.sql) {
          alert(status.errormsg + "\n\n" + status.sql);
        } else {
          location.reload();
        }
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    },
  });
};

$("#location_form_delete").submit(function (e) {
  e.preventDefault();
  deleteLocation();
});


// Handle tab change
$(document).on('shown.bs.tab', 'button[data-bs-toggle="tab"]', function (e) {
  var tab = $(e.target);
  var contentId = tab.attr("data-bs-target");

  if (tab.hasClass('active')) {

    if (contentId === "#locations") {

    $("#addButtonSm").attr("href", "#addLocationModal")
    $("#addButton").attr("href", "#addLocationModal")

    } else if (contentId === "#employees") {

      $("#addButtonSm").attr("href", "#addEmployeeModal")
      $("#addButton").attr("href", "#addEmployeeModal")
      $("#employeesTable").css("display", "block");


    } else if (contentId === "#departments") {

      $("#addButtonSm").attr("href", "#addDepartmentModal");
      $("#addButton").attr("href", "#addDepartmentModal");
      $("#employeesTable").css("display", "none");
    }
  }
});
