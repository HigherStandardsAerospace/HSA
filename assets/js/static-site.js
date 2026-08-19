(function () {
  'use strict';

  var form = document.querySelector('[data-formsubmit-contact]');
  if (form) {
    form.addEventListener('submit', function (event) {
      var endpoint = form.getAttribute('action') || '';
      var status = form.querySelector('[data-form-status]');
      var submitButton = form.querySelector('[type="submit"]');

      if (!endpoint || endpoint.indexOf('https://formsubmit.co/') !== 0) {
        event.preventDefault();
        status.textContent = 'The contact form is temporarily unavailable. Please email sales@higherstandardsaerospace.com.';
        status.className = 'static-form-status contact-form-error';
        return;
      }

      status.textContent = 'Sending your message...';
      status.className = 'static-form-status contact-form-progress';
      submitButton.disabled = true;
      submitButton.value = 'Sending...';

      try {
        window.sessionStorage.setItem('hsaContactSubmissionPending', 'contact');
      } catch (error) {
        // The form still works when browser storage is unavailable.
      }
    });
  }

  var contactSuccess = document.querySelector('[data-contact-success]');
  if (contactSuccess) {
    try {
      var contactSubmissionPending = window.sessionStorage.getItem('hsaContactSubmissionPending');
      if (contactSubmissionPending && typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', { method: 'formsubmit' });
      }
      window.sessionStorage.removeItem('hsaContactSubmissionPending');
    } catch (error) {
      // The confirmation page does not depend on analytics or browser storage.
    }
  }

  var capabilitySearch = document.querySelector('[data-capabilities-search]');
  if (capabilitySearch) {
    var capabilityInput = capabilitySearch.querySelector('.homepage-capabilities-input');
    var capabilityResults = capabilitySearch.querySelector('.homepage-capabilities-results');
    var capabilityStatus = capabilitySearch.querySelector('.homepage-capabilities-status');
    var capabilitySource = capabilitySearch.getAttribute('data-source');
    var capabilityPageUrl = capabilitySearch.getAttribute('data-capabilities-url') || '/capabilities/';
    var capabilityContactUrl = capabilitySearch.getAttribute('data-contact-url') || '#contact';
    var capabilityRows = null;
    var capabilityRequest = null;
    var capabilityTimer = null;
    var activeCapabilityQuery = '';
    var minimumQueryLength = 2;
    var maximumGroups = 8;
    var maximumPartNumbers = 7;

    function normalizeCapabilityValue(value) {
      var normalized = String(value || '').toLowerCase();
      if (typeof normalized.normalize === 'function') {
        normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }
      return normalized.replace(/\s+/g, ' ').trim();
    }

    function prepareCapabilityRows(data) {
      var rows = data && data.rows ? data.rows : [];
      return rows.map(function (row) {
        var capability = {
          id: row[0],
          partNumber: String(row[1] || ''),
          description: String(row[2] || ''),
          manufacturer: String(row[3] || ''),
          ata: String(row[4] || ''),
          application: String(row[5] || '')
        };
        capability.searchText = normalizeCapabilityValue([
          capability.partNumber,
          capability.description,
          capability.manufacturer,
          capability.ata,
          capability.application
        ].join(' '));
        capability.normalizedPartNumber = normalizeCapabilityValue(capability.partNumber);
        capability.normalizedDescription = normalizeCapabilityValue(capability.description);
        return capability;
      });
    }

    function loadCapabilities() {
      if (capabilityRows) {
        return Promise.resolve(capabilityRows);
      }
      if (!capabilityRequest) {
        capabilityStatus.textContent = 'Loading capabilities...';
        capabilityRequest = window.fetch(capabilitySource, { credentials: 'same-origin' })
          .then(function (response) {
            if (!response.ok) {
              throw new Error('Capabilities data could not be loaded.');
            }
            return response.json();
          })
          .then(function (data) {
            capabilityRows = prepareCapabilityRows(data);
            return capabilityRows;
          })
          .catch(function (error) {
            capabilityRequest = null;
            throw error;
          });
      }
      return capabilityRequest;
    }

    function uniqueCapabilityValues(items, field) {
      var seen = {};
      var values = [];
      items.forEach(function (item) {
        var value = item[field];
        var key = normalizeCapabilityValue(value);
        if (value && !seen[key]) {
          seen[key] = true;
          values.push(value);
        }
      });
      return values;
    }

    function capabilityScore(item, query) {
      if (item.normalizedPartNumber === query) { return 0; }
      if (item.normalizedPartNumber.indexOf(query) === 0) { return 1; }
      if (item.normalizedDescription === query) { return 2; }
      if (item.normalizedDescription.indexOf(query) === 0) { return 3; }
      if (item.normalizedPartNumber.indexOf(query) > -1) { return 4; }
      if (item.normalizedDescription.indexOf(query) > -1) { return 5; }
      return 6;
    }

    function summarizeCapabilityValues(values, limit) {
      var visible = values.slice(0, limit);
      var remaining = values.length - visible.length;
      return visible.join(', ') + (remaining > 0 ? ' +' + remaining + ' more' : '');
    }

    function appendCapabilityMeta(container, label, value) {
      if (!value) { return; }
      var item = document.createElement('span');
      var itemLabel = document.createElement('strong');
      itemLabel.textContent = label + ': ';
      item.appendChild(itemLabel);
      item.appendChild(document.createTextNode(value));
      container.appendChild(item);
    }

    function closeCapabilityResults() {
      capabilityResults.hidden = true;
      capabilityResults.textContent = '';
      capabilityInput.setAttribute('aria-expanded', 'false');
    }

    function openCapabilityResults() {
      capabilityResults.hidden = false;
      capabilityInput.setAttribute('aria-expanded', 'true');
    }

    function renderCapabilityGroups(groups, totalGroups) {
      capabilityResults.textContent = '';

      groups.forEach(function (group) {
        var result = document.createElement('a');
        result.className = 'homepage-capability-result';
        result.href = capabilityPageUrl + '?q=' + encodeURIComponent(group.description);
        result.setAttribute('aria-label', 'View all ' + group.description + ' capabilities');

        var title = document.createElement('h5');
        title.className = 'homepage-capability-result-title';
        title.textContent = group.description;
        result.appendChild(title);

        var partNumbers = document.createElement('p');
        partNumbers.className = 'homepage-capability-part-numbers';
        var partNumberLabel = document.createElement('strong');
        partNumberLabel.textContent = 'Part numbers: ';
        partNumbers.appendChild(partNumberLabel);
        partNumbers.appendChild(document.createTextNode(
          summarizeCapabilityValues(uniqueCapabilityValues(group.items, 'partNumber'), maximumPartNumbers)
        ));
        result.appendChild(partNumbers);

        var meta = document.createElement('div');
        meta.className = 'homepage-capability-meta';
        appendCapabilityMeta(meta, 'Manufacturer', summarizeCapabilityValues(uniqueCapabilityValues(group.items, 'manufacturer'), 2));
        appendCapabilityMeta(meta, 'ATA', summarizeCapabilityValues(uniqueCapabilityValues(group.items, 'ata'), 3));
        appendCapabilityMeta(meta, 'Application', summarizeCapabilityValues(uniqueCapabilityValues(group.items, 'application'), 2));
        result.appendChild(meta);

        var viewAll = document.createElement('span');
        viewAll.className = 'homepage-capability-view-all';
        viewAll.textContent = 'View all matching parts \u2192';
        result.appendChild(viewAll);

        capabilityResults.appendChild(result);
      });

      openCapabilityResults();
      capabilityStatus.textContent = totalGroups === groups.length
        ? totalGroups + (totalGroups === 1 ? ' matching component group.' : ' matching component groups.')
        : 'Showing ' + groups.length + ' of ' + totalGroups + ' matching component groups.';
    }

    function renderNoCapabilityResults() {
      capabilityResults.textContent = '';
      var empty = document.createElement('div');
      empty.className = 'homepage-capabilities-empty';
      empty.appendChild(document.createTextNode('No matching capabilities found. '));
      var contactLink = document.createElement('a');
      contactLink.href = capabilityContactUrl;
      contactLink.textContent = 'Contact HSA';
      empty.appendChild(contactLink);
      capabilityResults.appendChild(empty);
      openCapabilityResults();
      capabilityStatus.textContent = 'No matching capabilities found.';
    }

    function runCapabilitySearch() {
      var rawQuery = capabilityInput.value.trim();
      var query = normalizeCapabilityValue(rawQuery);
      activeCapabilityQuery = query;

      if (query.length < minimumQueryLength) {
        closeCapabilityResults();
        capabilityStatus.textContent = 'Enter at least two characters to search our capabilities.';
        return;
      }

      loadCapabilities().then(function (rows) {
        if (query !== activeCapabilityQuery) { return; }

        var grouped = {};
        rows.forEach(function (item) {
          if (item.searchText.indexOf(query) === -1) { return; }
          var key = item.normalizedDescription || item.description;
          if (!grouped[key]) {
            grouped[key] = {
              description: item.description,
              items: [],
              score: capabilityScore(item, query)
            };
          }
          grouped[key].items.push(item);
          grouped[key].score = Math.min(grouped[key].score, capabilityScore(item, query));
        });

        var groups = Object.keys(grouped).map(function (key) { return grouped[key]; });
        groups.sort(function (a, b) {
          if (a.score !== b.score) { return a.score - b.score; }
          return a.description.localeCompare(b.description);
        });

        if (!groups.length) {
          renderNoCapabilityResults();
          return;
        }
        renderCapabilityGroups(groups.slice(0, maximumGroups), groups.length);
      }).catch(function () {
        if (query !== activeCapabilityQuery) { return; }
        closeCapabilityResults();
        capabilityStatus.textContent = 'Capabilities search is temporarily unavailable. Please contact HSA.';
      });
    }

    capabilityInput.addEventListener('input', function () {
      window.clearTimeout(capabilityTimer);
      capabilityTimer = window.setTimeout(runCapabilitySearch, 100);
    });

    capabilityInput.addEventListener('focus', function () {
      if (normalizeCapabilityValue(capabilityInput.value).length >= minimumQueryLength) {
        runCapabilitySearch();
      }
    });

    capabilityInput.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeCapabilityResults();
        capabilityInput.blur();
      }
    });

    document.addEventListener('click', function (event) {
      if (!capabilitySearch.contains(event.target)) {
        closeCapabilityResults();
      }
    });
  }

  var search = document.getElementById('buscador');
  if (search) {
    var tableRows = document.querySelectorAll('#miTabla tr');
    var tableStatus = document.querySelector('[data-capabilities-table-status]');

    function filterCapabilitiesTable() {
      var filter = search.value.trim().toUpperCase();
      var visibleCount = 0;

      for (var i = 1; i < tableRows.length; i += 1) {
        var isVisible = tableRows[i].textContent.toUpperCase().indexOf(filter) > -1;
        tableRows[i].style.display = isVisible ? '' : 'none';
        if (isVisible) { visibleCount += 1; }
      }

      if (tableStatus) {
        tableStatus.textContent = filter
          ? visibleCount + (visibleCount === 1 ? ' matching capability.' : ' matching capabilities.')
          : (tableRows.length - 1) + ' capabilities available.';
      }
    }

    var initialQuery = '';
    try {
      initialQuery = new URLSearchParams(window.location.search).get('q') || '';
    } catch (error) {
      // The capabilities table still works in browsers without URLSearchParams.
    }

    if (initialQuery) { search.value = initialQuery; }
    filterCapabilitiesTable();
    search.addEventListener('input', filterCapabilitiesTable);
  }

  var backToTop = document.getElementById('backToTopBtn');
  if (backToTop) {
    backToTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    window.addEventListener('scroll', function () {
      backToTop.style.display = window.scrollY > 20 ? 'block' : 'none';
    });
  }
}());
