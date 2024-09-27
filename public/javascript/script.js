const modal = document.getElementById('myModal');
const modal2 = document.getElementById('myModal2');
const tr1 = document.getElementById('tr1');
const closeButton = document.querySelector('.close');
document.addEventListener('DOMContentLoaded', () => {
  const ticketForm = document.getElementById('ticketForm');
  const customersBtn = document.getElementById('customersBtn');
  const customerForm = document.getElementById('customerForm');
  const ticketsBtn = document.getElementById('ticketsBtn');
  const ticketsTableContainer = document.getElementById('ticketsTableContainer');
  const customersTableContainer = document.getElementById('customersTableContainer');

  let isAdmin = false; 

  const token = getToken();
  if (!token) {
    alert('No token found. Please log in.');
    return;
  }

  fetch('/api/customers/get-role', { 
    headers: {
      'auth-token': token
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.role === 'admin') {
        ticketForm.style.display = 'none';
        customerForm.style.display = 'block';
        customersBtn.style.display = 'block';

        isAdmin = true; 
        fetchCustomers(); 
      } else {
        customerForm.style.display = 'none';
        ticketForm.style.display = 'block';
        customersBtn.style.display = 'none';

        isAdmin = false; 
      }
    })
    .catch(error => {
      console.error('Error fetching role:', error);
    });

  customersBtn.addEventListener('click', function () {
    if (isAdmin) {
      ticketsTableContainer.style.display = 'none';
      customersTableContainer.style.display = 'block';

      customersBtn.style.display = 'none';
      ticketsBtn.style.display = 'block';
    }
  });

  ticketsBtn.addEventListener('click', function () {
    ticketsTableContainer.style.display = 'block';
    customersTableContainer.style.display = 'none';

    ticketsBtn.style.display = 'none';
    customersBtn.style.display = isAdmin ? 'block' : 'none';
  });
});




// Create a new ticket
ticketForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const project = document.getElementById('project').value;
  const subject = document.getElementById('subject').value;
  const priority = document.querySelector('input[name="priority"]:checked').value;
  const type = document.getElementById('type').value;
  const description = document.getElementById('description').value;

  const token = getToken();

  if (!token) {
    alert("No token provided. Please log in.");
    return;
  }

  try {
    const response = await fetch('/api/tickets/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token
      },
      body: JSON.stringify({ project, subject, priority, type, description })
    });

    if (response.ok) {
      alert('Ticket created successfully!');
      fetchTickets(); 
    } else {
      const result = await response.json();
      alert('Ticket creation failed: ' + result.msg);
    }
  } catch (error) {
    console.error('Error creating ticket:', error);
  }
});



// Fetch and display tickets
async function fetchTickets() {
  const token = getToken();

  if (!token) {
    alert("No token provided. Please log in.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/tickets/all", {
      headers: {
        'auth-token': token
      }
    });


    if (!response.ok) {
      throw new Error('Failed to fetch tickets');
    }

    const tickets = await response.json();
    console.log("Fetched tickets:", tickets);

    const tableBody = document.querySelector(".tickets-table tbody");
    tableBody.innerHTML = "";

    let openTicketsCount = 0;
    let processedTicketsCount = 0;

    tickets.forEach(ticket => {
      const row = document.createElement("tr");

      const createCell = (text) => {
        const cell = document.createElement("td");
        cell.textContent = text;
        return cell;
      };

      row.appendChild(createCell(ticket.ticket_id));
      row.appendChild(createCell(ticket.project));
      row.appendChild(createCell(ticket.subject));
      row.appendChild(createCell(ticket.priority));
      row.appendChild(createCell(ticket.type));
      row.appendChild(createCell(new Date(ticket.created_at).toLocaleDateString()));

      tableBody.appendChild(row);

         // Add a click event to each row to show the modal and populate data
row.addEventListener('click', function () {
  modal.style.display = 'flex';



      const recupIdSubjecDiv = document.querySelector('.recup-id-subjec');
      const boss = document.querySelector('.boss');
      const boss1 = document.querySelector('.boss1');

      // Write ticket information in modal
      recupIdSubjecDiv.innerHTML = `
        <p style='font-size: 30px;'> ${ticket.ticket_id} &nbsp; &nbsp; &nbsp; ${ticket.subject}</p>`;
      boss1.innerHTML = `<p><b>${ticket.type}</b></p>`;
      boss.innerHTML = `<p><b>${ticket.priority}</b></p>`;

      // Display ticket activity in accordion
      const accordionContainer = document.querySelector('.accordion-container');
      accordionContainer.innerHTML = `
        <div class="accordion">
          <p>Ticket Created: ${ticket.created_at}</p>
          <img src="../public/image/arrow.jpg" class="arrow" />
        </div>
        <div class="panel">
          <p>${ticket.description}</p>
        </div>`;

      // Loop through messages (from ticket.userMessages) and add to the accordion
      ticket.userMessages.forEach(message => {
        accordionContainer.innerHTML += `
          <div class="accordion">
            <p>${message.sender === 'admin' ? 'Admin Response' : 'User Message'}</p>
            <img src="../public/image/arrow.jpg" class="arrow" />
          </div>
          <div class="panel">
            <p>${message.content}</p>
          </div>`;
      });

   

});
 

      // Count open and processed tickets
      if (ticket.status === 'open') {
        openTicketsCount++;
      } else if (ticket.status === 'processed') {
        processedTicketsCount++;
      }
    });

    document.getElementById('ticketCount').textContent = tickets.length;
    document.getElementById('openTicketCount').textContent = openTicketsCount;
    document.getElementById('processedTicketCount').textContent = processedTicketsCount;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    alert("An error occurred while fetching the tickets.");
  }
}

fetchTickets();



// Modal close functionality
closeButton.addEventListener('click', function () {
  modal.style.display = 'none';
  modal2.style.display = 'none';
});

// Close the modal when clicking outside the modal content
window.addEventListener('click', function (event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});



////////////////////////////////////////////
///////--------CUSTOMERS-----------/////////
////////////////////////////////////////////


//////////----REGISTER A NEW CUSTOMER----//////////

document.getElementById('customerForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone_number = document.getElementById('phone_number').value;
  const project = document.getElementById('project1').value;
  const password = document.getElementById('password').value;

  console.log('Selected project:', project1);

  if (!name || !email || !project || !phone_number || !password) {
    alert("Please fill all the fields.");
    return;
  }

  try {
    const response = await fetch('api/customers/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, phone_number, project, password})
    });

    if (response.ok) {
      alert('Customer registered successfully!');
      document.getElementById('customerForm').reset(); // Reset form after success
      fetchCustomers(); // Fetch and display updated customer list
    } else {
      const result = await response.json();
      alert('Registration failed: ' + result.msg);
    }
  } catch (error) {
    console.error('Error registering customer:', error);
  }
});


//////////----FETCH AND DISPLAY ALL CUSTOMERS----//////////
async function fetchCustomers() {
  try {
    const response = await fetch('api/customers/all', {
      headers: {
        'auth-token': getToken()
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }

    const result = await response.json();
    const customers = result.customers;

    const tableBody = document.querySelector('#customersTable tbody');
    tableBody.innerHTML = ''; 

    if (customers.length === 0) {
      alert('No customers found.');
      return;
    }

    customers.forEach(customer => {
      const row = document.createElement('tr');

      const createCell = (text) => {
        const cell = document.createElement('td');
        cell.textContent = text;
        return cell;
      };

      row.appendChild(createCell(customer.id));
      row.appendChild(createCell(customer.project));
      row.appendChild(createCell(customer.name));
      row.appendChild(createCell(customer.email));
      row.appendChild(createCell(customer.phone_number));
      row.appendChild(createCell(new Date(customer.created_at).toLocaleDateString())); 

      const deleteBtn = document.querySelector('#deleteCustomersBtn');



      row.addEventListener('click', function () {

        modal2.style.display = 'flex';

        const recupIdSubjecDiv = document.getElementById('recup-id-subjec2');
        const boss = document.getElementById('boss2');
        const boss1 = document.getElementById('boss12');

        

        // write ticket information in modal
        recupIdSubjecDiv.innerHTML = `
          <p><strong style='font-size: 30px;'> ${customer.id  } ${customer.email}</strong></p>`;
        boss1.innerHTML = `<p><b>${customer.name}</b></p>`;
        boss.innerHTML = `<p><b>${customer.project}</b></p>`;

        deleteBtn.dataset.customerId = customer.id; 
      });

      tableBody.appendChild(row);
    });
  } catch (error) {
    if (isAdmin) { 
      console.error('Error fetching customers:', error);
      alert('An error occurred while fetching customers.');
    }
  }
}



fetchCustomers();


function getToken() {
  return localStorage.getItem('auth-token');
}


window.addEventListener('click', function (event) {
  if (event.target === modal2) {
    modal2.style.display = 'none';
  }
});


//////////----DELETE CUSTOMERS----//////////

function getToken() {
  return localStorage.getItem('token');
}

function addDeleteButtonListener(deleteCustomersBtn) {
  deleteCustomersBtn.addEventListener('click', async () => {
    const customerId = deleteCustomersBtn.dataset.customerId; // Retrieve the ID from the button

    if (!customerId) {
      alert("Customer ID is missing.");
      return;
    }

    const token = getToken();
    if (!token) {
      alert("No token provided. Please log in.");
      return;
    }

    const confirmDelete = confirm("Are you sure you want to delete this customer?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'auth-token': token
        }
      });

      if (response.ok) {
        alert('Customer deleted successfully.');
        // Close the modal and remove the row from the table
        
        document.getElementById('myModal2').style.display = 'none';
        document.getElementById('tr1').remove();
      } else {
        const result = await response.json();
        alert('Failed to delete customer: ' + result.msg);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('An error occurred while deleting the customer.');
    }
  });
}

// Call this once the modal is shown
const deleteBtn = document.querySelector('#deleteCustomersBtn');
addDeleteButtonListener(deleteBtn);



const accordions = document.querySelectorAll('.accordion');
accordions.forEach(accordion => {
accordion.addEventListener('click', () => {
const panel = accordion.nextElementSibling;
accordion.classList.toggle('active');
if (panel.style.maxHeight) {
panel.style.maxHeight = null;
} else {
panel.style.maxHeight = panel.scrollHeight + 'px';
}
});
});