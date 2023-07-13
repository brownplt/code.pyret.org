// Adapted from https://www.cssscript.com/minimal-accessible-dropdown-menu/
// function bindAll() {

// }

function bindDropdown(container) {
	const trigger = $(".dropdown-toggle", container)[0];
    const menu = $(".dropdown-menu", container)[0];

	let index = -1,
		isOpened = false,
		focusedEl = '';

	function toggleClass(element, className) {

		if (element.classList.contains(className)) {
			setTimeout(() => {
				element.classList.remove(className);
				isOpened = false;
			});
		} else {
			setTimeout(() => {
				element.classList.add(className);
				isOpened = true;
			});
		}
	}

	function deleteActiveClassInArr(arr, className) {
		for (let i = 0; i < arr.length; i++) {
			arr[i].classList.remove(className);
		}
	}

	function addActiveClassMenuEl(arr, className) {
		deleteActiveClassInArr(arr, className);
		arr[index].classList.add(className);
	}

	function closeMenu(menu, activeClass) {
		index = -1;
		isOpened = false;
		menu.classList.remove(activeClass);
	}

    console.log(trigger);
    const path = trigger.getAttribute('data-dd-target');
    console.log(path);
    // const menu = trigger.querySelector(`[data-dd-path="${path}"]`);
    console.log(menu);

    const menuItems = menu.querySelectorAll('.dropdown-menu__link'),
        lastItem = menuItems[menuItems.length - 1];

    menuItems.forEach(item => {
        item.addEventListener('focus', (e) => {
            focusedEl = e.target;
        });

        item.addEventListener('keydown', (e) => {
            if (e.code === 'Enter' && e.target === focusedEl) {
                closeMenu(menu, 'dropdown-menu--active');
            }

            if (e.code === 'Escape' && focusedEl) {
                closeMenu(menu, 'dropdown-menu--active');
                trigger.focus();
            }
        });
    });

    document.addEventListener('click', (e) => {
        const target = e.target;

        if (!target) { return; }

        if (target === trigger || target.id === "current-whitelist-ctx") {
            e.preventDefault();
            toggleClass(menu, 'dropdown-menu--active');
        }

        if (target != menu) {
            index = -1;
            closeMenu(menu, 'dropdown-menu--active');
            deleteActiveClassInArr(menuItems, 'dropdown-menu__link--active');
        }
    });

    lastItem.addEventListener('blur', () => {
        closeMenu(menu, 'dropdown-menu--active');
    });

    trigger.addEventListener('keydown', (e) => {
        if (e.code === 'Escape') {
            closeMenu(menu, 'dropdown-menu--active');
            deleteActiveClassInArr(menuItems, 'dropdown-menu__link--active');
        }

        if (isOpened && menuItems.length > 0) {
            switch (e.code) {
                case 'ArrowUp':
                    index--;
                    if (index < 0) {
                        index = menuItems.length - 1;
                    }
                    addActiveClassMenuEl(menuItems, 'dropdown-menu__link--active');
                    break;

                case 'ArrowDown':
                    index++;
                    if (index > menuItems.length - 1) {
                        index = 0;
                    }
                    addActiveClassMenuEl(menuItems, 'dropdown-menu__link--active');
                    break;

                case 'Enter':
                    deleteActiveClassInArr(menuItems, 'dropdown-menu__link--active');

                    if (index > -1) {
                        menuItems[index].click();
                    }
                    break;
            }
        }
    });
}


// function autoBind() {
//     console.log($(".dropdown"));
//     $(".dropdown").map(
//         (elt) => bindDropdown(elt)
//     );
// }
