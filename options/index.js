var getCurrentOptions = $.getJSON('/options');
var getSchema = $.getJSON('/schema.json');
var saveOptions = function (options) {
  return $.ajax({
    url: '/options',
    data: {
      json: JSON.stringify(options)
    },
    type: 'POST'
  });
};
var testAlarm = function () {
  return $.ajax({
    url: '/test',
    type: 'POST'
  });
};

function createEditor(schema) {
  return new JSONEditor(document.getElementById('editor_holder'), {
    schema: schema,
    theme: 'bootstrap3',
    disable_collapse: true,
    disable_edit_json: true,
    disable_properties: true
  });
}

function createOptionsSetter(editor) {
  return function (options) {
    if (typeof options === 'object') {
      // Upgrade options if needed
      var props = editor.schema.properties;
      var validOptions = {};
      Object.keys(props).forEach(function (prop) {
        if (options[prop] === undefined) {
          validOptions[prop] = props[prop].default;
        } else {
          validOptions[prop] = options[prop];
        }
      });
      return editor.setValue(validOptions);
    }
  };
}

function now() {
  return new Date().toString();
}

function setupEditor(editor) {
  var setOptions = createOptionsSetter(editor);
  document.getElementById('submit').addEventListener('click', function () {
    saveOptions(editor.getValue()).then(function () {
      document.getElementById('saved').innerHTML = 'Saved at ' + now();
    });
  });
  document.getElementById('test').addEventListener('click', function () {
    testAlarm().then(function () {
      document.getElementById('saved').innerHTML = 'Testing...';
    });
  });
  return getCurrentOptions.then(setOptions);
}

function showInfo() {
  $.get('/info', function (info) {
    $('#info-name').html(info.name);
    $('#info-room').html(info.room);
    $('#info-state').html(info.state);
  });
  $.get('/schedules', function (schedules) {
    let html = '';
    schedules.forEach(person => {
      person.events.forEach(event => {
        html += `<tr>
          <th scope="row">${event.time}</th>
          <td>&nbsp;&nbsp;${event.summary}</td>
        </tr>`;
      })
    })
    $('.table2 tbody').html(
      html || 'No events'
    );
  });
}

getSchema.then(createEditor).then(setupEditor).then(showInfo);
