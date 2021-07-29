const section = document.querySelector('.form');
const inputFile = document.querySelector('#input-file');
const btnReset = document.querySelector('.btn-reset');
const filesMenu = document.querySelector('.menu');
let selectedFiles;
let file;
const reader = new FileReader();
const request = new XMLHttpRequest();

inputFile.addEventListener('change', () => {
	selectedFiles = document.querySelector('#input-file').files;
	filesMenu.innerHTML = '';

	const select = document.createElement("select");
	for (let i = 0; i < selectedFiles.length; i++) {
		const file = selectedFiles[i];
		const option = document.createElement("option");
		option.textContent = file.name;
		select.appendChild(option);
	}
	select.size = selectedFiles.length;
	select.classList.add("mb-1", "form-control");
	filesMenu.appendChild(select);

	file = selectedFiles[0];
	parser(file);
})

filesMenu.addEventListener('click', (e) => {
	for (let i = 0; i < selectedFiles.length; i++) {
		if (e.target.textContent === selectedFiles[i].name) {
			file = selectedFiles[i];
			parser(file);
			break;
		}
	}
})

btnReset.addEventListener('click', () => {
	section.innerHTML = '';
	filesMenu.innerHTML = '';
})

function parser(file) {
	section.innerHTML = '';
	reader.readAsDataURL(file);
	reader.onload = function () {
		request.open('GET', reader.result);
		request.responseType = 'text';
		request.send();
	};

	request.onload = function () {
		const jsonText = request.response;
		const jsonObj = JSON.parse(jsonText);
		createPage(jsonObj);
	}

}



function createPage(jsonObj) {
	const keys = Object.keys(jsonObj)
	jsonObj[keys[1]].forEach((elem, i) => {
		const fieldsKeys = Object.keys(elem);
		fieldsKeys.forEach(el => {
			switch (el) {
				case "input":
					createInput(elem[el], i);
					break;
				case "label":
					createLabel(elem, i);
					break;
				default:
					console.log(elem)
					break;
			}
		});
	});

	if (jsonObj["references"]) {
		jsonObj["references"].forEach((elem) => {
			const referencesKeys = Object.keys(elem);
			// console.log(referencesKeys)
			if (elem["input"]) {
				createInput(elem["input"], 'tofix')
				return 0;
			}
			createReference(elem);
		});
	}

	if (jsonObj["references"]) {
		const buttons = [];
		jsonObj["buttons"].forEach((elem, index) => {
			buttons[index] = createButton(elem, index);

		});
		if (buttons.length) {
			const div = document.createElement("div");
			buttons.forEach(button => {
				div.appendChild(button);
			});
			section.appendChild(div);
		}
	}
	const inputs = document.querySelectorAll(`input[data-mask]`);
	for (let i = 0; i < inputs.length; i++) {
		const input = inputs[i];
		input.addEventListener('keydown', mask)
	}
}

function mask(e) {
	let input = e.target;
	let inputValue = input.value;
	let inputPos = inputValue.length;
	let mask = input.dataset.mask.replace(/9/g, '_');
	let key = e.key;
	let keyCode = e.keyCode;

	if ((keyCode < 58 && keyCode > 47) || (keyCode < 106 && keyCode > 95)) {
		e.preventDefault();

		while (mask[inputPos] !== '_' && inputValue.length < mask.length) {
			input.value += mask[inputPos];
			inputPos++;
		}
		if (inputPos >= mask.length) return;
		input.value += key;
	} else {
		if ([8, 37, 39, 46].includes(keyCode)) return 0;
		e.preventDefault();
		return 0;
	}
}

function createInput(obj, i) {
	if (obj["type"] == "textarea") {
		const textarea = document.createElement("textarea")
		textarea.classList.add("mb-3", "form-control");
		if (obj["required"]) {
			textarea.required = true;
		}
		textarea.setAttribute("id", i);
		section.appendChild(textarea);
		return 0;
	}
	if (obj["type"] == "technology") {
		const select = document.createElement("select");
		select.multiple = true;
		obj["technologies"].forEach(element => {
			const option = document.createElement("option");
			option.textContent = element;
			select.appendChild(option);
		});
		select.classList.add("mb-3", "form-control");
		select.size = obj["technologies"].length;
		section.appendChild(select);
		return 0;
	}



	const input = document.createElement("input");
	input.classList.add("mb-3", "form-control");
	input.type = obj["type"];
	if (obj["placeholder"]) {
		input.placeholder = obj["placeholder"];
	}
	if (obj["required"] == true) {
		input.required = true;
	}
	if (obj["checked"] == true) {
		input.checked = true;
		input.classList.remove("form-control");
	}
	if (obj["multiple"] == true) {
		input.multiple = true;
	}
	if (obj["filetype"]) {
		const accept = [];
		obj["filetype"].forEach((element, index) => {
			switch (element) {
				case "jpeg":
				case "png":
					accept[index] = `image/${element}`
					break;
				default:
					accept[index] = `application/${element}`
					break;
			}
		});
		input.accept = accept.join(",");
	}
	if (obj["type"] == "color") {
		input.setAttribute("list", `colors-${i}`);
		// input.value = "#aaaaaa";
		input.classList.add("input-color");
		const datalist = document.createElement("datalist");
		datalist.id = `colors-${i}`;
		// console.log(obj["colors"]);
		obj["colors"].forEach(color => {
			const option = document.createElement("option");
			option.value = color;
			datalist.appendChild(option);
		});
		section.appendChild(datalist)
	}
	if (obj["type"] == "checkbox") {
		input.classList.remove("form-control", "mb-3");
		input.classList.add("me-2")
	}
	if (obj["mask"]) {
		input.type = 'text';
		input.setAttribute('maxlength', obj["mask"].length);
		input.setAttribute('data-mask', obj["mask"]);
		input.placeholder = obj["mask"];
	}
	input.setAttribute("id", i);
	section.appendChild(input);
}

function createReference(obj) {
	const span = document.createElement("span");
	const a = document.createElement("a");
	if (obj["text without ref"]) {
		span.textContent = obj["text without ref"];
		span.classList.add("me-1");
		section.appendChild(span)
	}
	a.textContent = obj["text"];
	a.classList.add("me-3", "mb-3")
	a.setAttribute("href", obj["ref"]);
	section.appendChild(a)
}

function createButton(obj, index) {
	const button = document.createElement("button");
	button.type = "button";
	button.classList.add("btn", "mb-3", "me-2", "mt-3");
	if (index == 0) {
		button.classList.add("btn-primary");
		button.type = "submit";
	} else {
		button.classList.add("btn-outline-primary");
	}
	button.textContent = obj["text"];
	// section.appendChild(button);
	return button;
}

function createLabel(obj, i) {
	const label = document.createElement("label");
	label.setAttribute("for", i);
	label.textContent = obj["label"];
	section.appendChild(label)

}
