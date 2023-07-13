import React from 'react';
import ReactDOM from 'react-dom';
import StudentDashboard from './StudentDashboard';
import '../../css/dashboard/index.css';

var load_dropdown_js = function () {
  // console.log("hello? is this working?");
  let dropdown_js = document.createElement("script");
  dropdown_js.setAttribute("src", "js/dropdowns.js");
  document.body.appendChild(dropdown_js);
  // console.log(bootstrap_js);
};

ReactDOM.render(
  <StudentDashboard />,
  document.getElementById('root'),
  () =>

    // Make the "start coding" dropdowns interactible. This is probably the sort of thing that should be bundled into the React component, but I'm more familiar with this style.
    $(".dropdown").each(
      (i, container) => bindDropdown(container)
    )
);