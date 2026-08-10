(function () {
  'use strict';

  var form = document.querySelector('[data-formsubmit-contact]');
  if (form) {
    form.addEventListener('submit', function (event) {
      var departmentSelect = form.elements.department;
      var selectedOption = departmentSelect.options[departmentSelect.selectedIndex];
      var endpoint = selectedOption ? selectedOption.getAttribute('data-formsubmit-endpoint') : '';
      var departmentId = selectedOption ? selectedOption.getAttribute('data-department-id') : '';
      var status = form.querySelector('[data-form-status]');
      var submitButton = form.querySelector('[type="submit"]');

      if (!endpoint || endpoint.indexOf('https://formsubmit.co/') !== 0) {
        event.preventDefault();
        status.textContent = 'Please select a department before sending your message.';
        status.className = 'static-form-status contact-form-error';
        departmentSelect.focus();
        return;
      }

      form.action = endpoint;
      form.elements._subject.value = 'HSA Website Inquiry - ' + selectedOption.value;
      status.textContent = 'Sending your message...';
      status.className = 'static-form-status contact-form-progress';
      submitButton.disabled = true;
      submitButton.value = 'Sending...';

      try {
        window.sessionStorage.setItem('hsaContactSubmissionPending', departmentId || 'contact');
      } catch (error) {
        // The form still works when browser storage is unavailable.
      }
    });
  }

  var contactSuccess = document.querySelector('[data-contact-success]');
  if (contactSuccess) {
    try {
      var submittedDepartment = window.sessionStorage.getItem('hsaContactSubmissionPending');
      if (submittedDepartment && typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', { method: 'formsubmit', department: submittedDepartment });
      }
      window.sessionStorage.removeItem('hsaContactSubmissionPending');
    } catch (error) {
      // The confirmation page does not depend on analytics or browser storage.
    }
  }

  var search = document.getElementById('buscador');
  if (search) {
    search.addEventListener('keyup', function () {
      var filter = search.value.toUpperCase();
      var rows = document.querySelectorAll('#miTabla tr');
      for (var i = 1; i < rows.length; i += 1) {
        rows[i].style.display = rows[i].textContent.toUpperCase().indexOf(filter) > -1 ? '' : 'none';
      }
    });
  }

  var backToTop = document.getElementById('backToTopBtn');
  if (backToTop) {
    backToTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    window.addEventListener('scroll', function () {
      backToTop.style.display = window.scrollY > 20 ? 'block' : 'none';
    });
  }
}());
