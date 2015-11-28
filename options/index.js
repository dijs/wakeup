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
        validOptions[prop] = options[prop] || props[prop].default;
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

getSchema.then(createEditor).then(setupEditor).then(function () {
  console.log('done');
});
