import React from 'react';
import ReactDOM from 'react-dom';
import StudentDashboard from './StudentDashboard';
import '../../css/dashboard/index.css';

ReactDOM.render(
  <StudentDashboard />,
  document.getElementById('root'),
  () =>

    // Make the "start coding" dropdowns interactible. This is probably the sort of thing that should be bundled into the React component, but I'm more familiar with this style.
    $(".dropdown").each(
      (i, container) => bindDropdown(container)
    )
);