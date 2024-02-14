
$(document).ready(async function () {
    var jsonData = await fetchData();
    var selectedRun = Object.keys(jsonData)[0];
    $(`#table-select-runs1 tr[data-name=${selectedRun}]`).addClass("row-selected");
    var selectedRun2 = -1;
    var jsonArray = getTestRun(selectedRun, selectedRun2, jsonData);
    var currentArray = jsonArray;
    var currentTestName = -1;
    buildRunTables(jsonData, "", selectedRun, selectedRun2);
    buildFilter(jsonArray);
    currentArray = filterTable($("#search-input").val(), jsonArray);
    buildTable(currentArray, currentTestName);
    showCorrectElement(currentTestName, selectedRun2);

    $(document).on("click", ".button-toggle", function() {
        $(`#div-${this.id}`).toggleClass("visually-hidden");
    });

    $(document).on("click", ".form-check-input", function() {
        currentArray = filterTable($("#search-input").val(), jsonArray);
        buildTable(currentArray, currentTestName);
    });

    $(".button-toggle-filter").on("click", function() {
        var buttonId = this.id;
        var value = document.querySelector('input[name="filter-radio"]:checked').value;
        if (value == "all"){
            var values = ["status", "error", "type", "group"]
        }
        else {
            var values = [value]
        }
        values.forEach(function(v) {
            var divElem = document.getElementById(`container-filter-${v}`);
            var checkNodes = divElem.querySelectorAll("input");
            checkNodes.forEach(function(check) {
                if (buttonId.endsWith("uncheck")) {
                    check.checked = false;
                }
                else {
                    check.checked = true;
                }

            });
        });
    });

    $("#button-expand-all").on("click", function() {
        var divNodes = document.querySelectorAll(`div.results-wrapper-big`);
        divNodes.forEach(function(div) {
            div.classList.remove("visually-hidden");
        });
    });

    $("#button-collapse-all").on("click", function() {
        var divNodes = document.querySelectorAll(`div.results-wrapper-big`);
        divNodes.forEach(function(div) {
            div.classList.add("visually-hidden");
        });
    });

    $("#button-matching").on("click", function() {
        var preNodes = document.querySelectorAll(`pre.normalText`);
        preNodes.forEach(function(label) {
            label.classList.toggle("visually-hidden");
        });
        preNodes = document.querySelectorAll(`pre.redText`);
        preNodes.forEach(function(label) {
            label.classList.toggle("visually-hidden");
        });
    });

    $("#search-input").on("keyup", function(){
        var value = $(this).val();
        currentArray = filterTable(value, jsonArray);
        buildTable(currentArray, currentTestName);
    });

    $("#search-input-run").on("keyup", function(){
        var value = $(this).val();
        buildRunTables(jsonData, value, selectedRun, selectedRun2);
    });

    $("#button-overview").on("click", function() {
        if (selectedRun2 == -1) {
            $("#button-overview").addClass("active");
            $("#button-details").removeClass("active");
            $("#container-test-details").addClass("visually-hidden");
            $("#container-test-overview").removeClass("visually-hidden");
        } else {
            $("#button-overview").addClass("active");
            $("#button-details").removeClass("active");
            $("#container-test-details-1").addClass("visually-hidden");
            $("#container-test-overview-1").removeClass("visually-hidden");
            $("#container-test-details-2").addClass("visually-hidden");
            $("#container-test-overview-2").removeClass("visually-hidden");
        }
    });

    $("#button-details").on("click", function() {
        if (selectedRun2 == -1) {
            $("#button-overview").removeClass("active");
            $("#button-details").addClass("active");
            $("#container-test-details").removeClass("visually-hidden");
            $("#container-test-overview").addClass("visually-hidden");
        } else {
            $("#button-overview").removeClass("active");
            $("#button-details").addClass("active");
            $("#container-test-details-1").removeClass("visually-hidden");
            $("#container-test-overview-1").addClass("visually-hidden");
            $("#container-test-details-2").removeClass("visually-hidden");
            $("#container-test-overview-2").addClass("visually-hidden");
        }
    });

    $("#table-select-tests").on("click", "tr", function() {
        handleAccordion("collapse-one", true);
        handleAccordion("collapse-three", false);
        var testName = $(this).data("name");
        if (testName != currentTestName) {
            $("#table-select-tests tr").removeClass("row-selected");
            $(this).addClass("row-selected");
            buildTestInformation(testName, jsonArray, selectedRun, selectedRun2);
        }
        currentTestName = testName;
        showCorrectElement(currentTestName, selectedRun2)
    });

    $("#table-select-runs1").on("click", "tr", function() {
        handleAccordion("collapse-two", false);
        var runName = $(this).data("name");
        $(`#table-select-runs1 tr[data-name=${selectedRun}]`).removeClass("row-selected");
        $(`#table-select-runs1 tr[data-name=${runName}]`).addClass("row-selected");
        selectedRun = runName;
        jsonArray = getTestRun(selectedRun, selectedRun2, jsonData);
        currentArray = jsonArray;
        currentTestName = -1;
        buildFilter(jsonArray);
        currentArray = filterTable($("#search-input").val(), jsonArray);
        buildTable(currentArray, currentTestName);
        showCorrectElement(currentTestName, selectedRun2)
    });

    $("#table-select-runs2").on("click", "tr", function() {
        handleAccordion("collapse-two", false);
        $(`#table-select-runs2 tr[data-name=${selectedRun2}]`).removeClass("row-selected");
        var runName = $(this).data("name");
        if (runName == selectedRun2){
            selectedRun2 = -1;
        } else {
            selectedRun2 = runName;
            $(`#table-select-runs2 tr[data-name=${runName}]`).addClass("row-selected");
        }
        jsonArray = getTestRun(selectedRun, selectedRun2, jsonData);
        currentArray = jsonArray;
        currentTestName = -1;
        buildFilter(jsonArray);
        currentArray = filterTable($("#search-input").val(),jsonArray);
        buildTable(currentArray, currentTestName);
        showCorrectElement(currentTestName, selectedRun2);
    });

});

function handleAccordion(itemId, collapse) {
    var item = document.getElementById(itemId);
    var bsCollapse = new bootstrap.Collapse(item, {
      toggle: false
    });
    if (collapse) {
        bsCollapse.hide();
    }
    else {
        bsCollapse.show();
    }
}

async function fetchData() {
    var jsonData = {};
    var runs = [];
    var resultsPath = "https://api.github.com/repos/SIRDNARch/test-web/contents/results";

    let data = await fetch(resultsPath).then(response => response.text());

    let fileFetchPromises = $(data).find("a").map(function() {
        var file = $(this).attr("href");
        runs.push(file);
        return fetch(`/results/${file}`).then(response => response.json());
    }).get();

    let fileDataArray = await Promise.all(fileFetchPromises);
    fileDataArray.forEach((fileData, index) => {
        var name = runs[index].replace(".json", "");
        jsonData[name] = fileData[name];
    });

    return jsonData;
}

function getTestRun(run1, run2, jsonData) {
    var result = {};
    if (run1 == -1 || run2 == -1) {
        if (run1 != -1) {
            result = jsonData[run1];
        } else if (run1 != -1) {
            result = jsonData[run2];
        } else {
            return;
        }
    } else {
        result = compare(jsonData[run1], jsonData[run2])
    }
    resultArray = convertObjectToArray(result);
    if (result.hasOwnProperty('info')) {
        resultArray.splice(resultArray.length - 1, 1);
    }
    return resultArray;
}

function convertObjectToArray(jsonData) {
    var jsonArray = Object.keys(jsonData).map(function (key) {
        return jsonData[key];
    });
    return jsonArray;
}

function buildRunTables(jsonData, filter, selectedRun, selectedRun2){
    var tableBodies = document.getElementsByClassName("table-body-runs");
    tableBodies[0].innerHTML = "";
    tableBodies[1].innerHTML = "";
    const keys = Object.keys(jsonData);
    for (var i in keys) {
        var info = jsonData[keys[i]].info;

        if (!keys[i].toLowerCase().includes(filter.toLowerCase())){
            continue;
        }

        function createRow() {
            var row = document.createElement("tr");
            row.setAttribute("data-name", keys[i]);
            row.setAttribute("id", keys[i] + "-" + Math.random().toString(36).slice(2, 11));
            var cell = document.createElement("td");
            var divRow = document.createElement("div");
            divRow.classList.add("row");
            var name = document.createElement("div");
            name.classList.add("col");
            name.innerHTML = keys[i];
            divRow.appendChild(name);
            var count = document.createElement("div");
            count.classList.add("col-md-auto");
            count.innerHTML += `${info.tests}-<label class="tests-passed">${info.passed}</label>`;
            count.innerHTML += `-<label class="tests-passedFailed">${info.passedFailed}</label>`;
            count.innerHTML += `-<label class="tests-failed">${info.failed}</label>`;
            count.innerHTML += `-<label class="tests-notTested">${info.notTested}</label>`;
            divRow.appendChild(count);
            cell.appendChild(divRow)
            row.appendChild(cell);
            return row;
        }
        tableBodies[0].appendChild(createRow());
        tableBodies[1].appendChild(createRow());
    }
    $(`#table-select-runs1 tr[data-name=${selectedRun}]`).addClass("row-selected");
    $(`#table-select-runs2 tr[data-name=${selectedRun2}]`).addClass("row-selected");
}

function buildTable(jsonArray, currentTestName){
    var tableBody = document.getElementById("table-body-tests");
    tableBody.innerHTML = "";
    for (var testNumber in jsonArray) {
        var test = jsonArray[testNumber];
        var row = document.createElement("tr");
        row.setAttribute("data-name", test.name);
        row.setAttribute("id", test.name);
        if (test.name == currentTestName) {
            row.setAttribute("class", "row-selected");
        }

        var testNameCell = document.createElement("td");
        testNameCell.textContent = test.name;
        row.appendChild(testNameCell);

        var testGroupCell = document.createElement("td");
        testGroupCell.textContent = test.group;
        row.appendChild(testGroupCell);

        var testTypeCell = document.createElement("td");
        testTypeCell.textContent = test.typeName;
        row.appendChild(testTypeCell);

        var statusCell = document.createElement("td");
        statusCell.textContent = test.status;
        row.appendChild(statusCell);

        var errorTypeCell = document.createElement("td");
        errorTypeCell.textContent = test.errorType;
        row.appendChild(errorTypeCell);

        tableBody.appendChild(row);
    }
}

function buildTestInformation(testName, jsonArray, selectedRun, selectedRun2){
    var buttonNodes = document.querySelectorAll(`#buttons-text input`);
    buttonNodes.forEach(function(node) {
        node.checked = true;
    });

    var testDetails = jsonArray.find((test) => test.name === testName);
    var overviewEntries = [
        { label: "Test Name", value: testDetails.name, key: "name", line: "True" },
        { label: "Comment", value: testDetails.comment, key: "comment", line: "True" },
        { label: "Test Status", value: testDetails.status, key: "status", line: "True" },
        { label: "Error Type", value: testDetails.errorType, key: "errorType", line: "True" },
    ];
    if (testDetails.errorType == "RESULTS NOT THE SAME" || testDetails.errorType.includes("Known")) {
        overviewEntries.push({ label: "Expected Query Result", value: [testDetails.expectedHtml, testDetails.expectedHtmlRed], key: "expectedHtml", line: "False" });
        overviewEntries.push({ label: "Query Result", value: [testDetails.gotHtml, testDetails.gotHtmlRed], key: "gotHtml", line: "False" });
        overviewEntries.push({ label: "Index File", value: escapeHtml(testDetails.graphFile), key: "graphFile", line: "False" });
        overviewEntries.push({ label: "Query File", value: escapeHtml(testDetails.queryFile), key: "queryFile", line: "False"  });
    }
    if (testDetails.errorType == "QUERY EXCEPTION") {
        overviewEntries.push({ label: "Query File", value: escapeHtml(testDetails.queryFile), key: "queryFile", line: "False" });
        overviewEntries.push({ label: "Query Log", value: testDetails.queryLog, key: "queryLog", line: "False"  });
    }
    if (testDetails.errorType == "REQUEST ERROR") {
        overviewEntries.push({ label: "Query File", value: escapeHtml(testDetails.queryFile), key: "queryFile", line: "False" });
        overviewEntries.push({ label: "Query Log", value: testDetails.queryLog, key: "queryLog", line: "False"  });
    }
    if (testDetails.errorType == "EXPECTED: QUERY EXCEPTION ERROR") {
        overviewEntries.push({ label: "Query File", value: escapeHtml(testDetails.queryFile), key: "queryFile", line: "False" });
        overviewEntries.push({ label: "Query Log", value: testDetails.queryLog, key: "queryLog", line: "False"  });
    }
    if (testDetails.errorType == "Undefined error") {
        overviewEntries.push({ label: "Query File", value: escapeHtml(testDetails.queryFile), key: "queryFile", line: "False" });
        overviewEntries.push({ label: "Query Log", value: testDetails.queryLog, key: "queryLog", line: "False"  });
    }
    if (testDetails.errorType == "INDEX BUILD ERROR") {
        overviewEntries.push({ label: "Index File", value: escapeHtml(testDetails.graphFile), key: "graphFile", line: "False"   });
        overviewEntries.push({ label: "Index Build Log", value: testDetails.indexLog, key: "indexLog", line: "False"  });
    }
    if (testDetails.errorType == "SERVER ERROR") {
        overviewEntries.push({ label: "Server Status", value: testDetails.serverStatus, key: "serverStatus", line: "True" });
        overviewEntries.push({ label: "Server Log", value: testDetails.serverLog, key: "serverLog", line: "False" });
    }

    var allEntries = [
        { label: "Index File", value: escapeHtml(testDetails.graphFile), key: "graphFile", line: "False"  },
        { label: "Index Build Log", value: testDetails.indexLog, key: "indexLog", line: "False"  },
        { label: "Query File", value: escapeHtml(testDetails.queryFile), key: "queryFile", line: "False"  },
        { label: "Query Sent", value: escapeHtml(testDetails.querySent), key: "querySent", line: "False"  },
        { label: "Query Log", value: testDetails.queryLog, key: "queryLog", line: "False"  },
        { label: "Server Status", value: testDetails.serverStatus, key: "serverStatus", line: "True" },
        { label: "Server Log", value: testDetails.serverLog, key: "serverLog", line: "False" },
        { label: "Expected Query Result",value: [testDetails.expectedHtml, testDetails.expectedHtmlRed], key: "expectedHtml", line: "False" },
        { label: "Query Result", value: [testDetails.gotHtml, testDetails.gotHtmlRed], key: "gotHtml", line: "False" },
        { label: "Query Filename", value: testDetails.query, key: "query", line: "True"  },
        { label: "Index Filename", value: testDetails.graph, key: "graph", line: "True" },
        { label: "Result Filename", value: testDetails.result, key: "result", line: "True"  },
        { label: "Result File", value: escapeHtml(testDetails.resultFile), key: "resultFile", line: "False" },
        { label: "Test Type", value: testDetails.type, key: "type", line: "True" },
        { label: "Test Feature", value: testDetails.feature, key: "feature", line: "True" },
        { label: "Approval", value: testDetails.approval, key: "approval", line: "True" },
        { label: "Approved by", value: testDetails.approvedBy, key: "approvedBy", line: "True" },
    ];

    if (selectedRun2 == -1){
        buildHTML(overviewEntries, "container-test-overview");
        buildHTML(allEntries, "container-test-details");
    } else {
        buildHTML(overviewEntries, "container-test-overview-1");
        buildHTML(allEntries, "container-test-details-1");

        overviewEntries = replaceEntries(overviewEntries, testDetails);
        allEntries = replaceEntries(allEntries, testDetails)         
        buildHTML(overviewEntries, "container-test-overview-2");
        buildHTML(allEntries, "container-test-details-2");
    }
}

function escapeHtml(html) {
    return html.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function replaceEntries(entries, testDetails){
    entries.forEach(function(entry) {
        entry.value = testDetails[entry.key + "-run2"];
    });
    return entries;
}

function buildHTML(entries, id){
    var element = document.getElementById(id);
    element.innerHTML = ""
    entries.forEach(entry => {
        if (entry.line == "True"){
            element.innerHTML += createSingleLineElement(entry.label, entry.value)
        } else {
            if (Array.isArray(entry.value)) {
                element.innerHTML += createElement(entry.label, entry.value[0], entry.value[1])
            }
            else {
                element.innerHTML += createElement(entry.label, entry.value, "")
            }
        }
    });
}

function compare(dict1, dict2) {
    let result = {};
    for (let key in dict1) {
        if (key === "info") continue
        if (dict1[key]["status"] != dict2[key]["status"] || dict1[key]["errorType"] != dict2[key]["errorType"]){
            result[key] = dict1[key]
            for (let subKey in dict2[key]){
                result[key][subKey + "-run2"] = dict2[key][subKey]
            }
        }
    }
    return result;
}

function showCorrectElement(currentTestName, selectedRun2){
    $("#nothing").addClass("visually-hidden");
    $("#buttons").addClass("visually-hidden");
    $("#toggles").addClass("visually-hidden");
    $("#compare").addClass("visually-hidden");
    $("#single").addClass("visually-hidden");
    if (currentTestName == -1) {
        $("#nothing").removeClass("visually-hidden");
    } else {
        $("#buttons").removeClass("visually-hidden");
        $("#toggles").removeClass("visually-hidden");
        if (selectedRun2 == -1) {
            $("#single").removeClass("visually-hidden");
        } else {
            $("#compare").removeClass("visually-hidden");
        }
    }
}

function createSingleLineElement(heading, text){
    var html = '<div class="row container-info">';
        html += `<div class="col heading"><strong>${heading}:</strong></div>`
        html += `<div class="col results-wrapper"><pre>${text}</pre></div>`;
    return html += '</div>';
}

function createElement(heading, text, text2){
    var className = ""
    if (text2 != ""){
        className = "normalText"
    }
    var id = Math.random().toString(36).slice(2, 11);
    var html = `<div class="row container-info">`;
        html += `<div class="col"><strong>${heading}:</strong></div>`;
        html += `<div class="col button">`;
        html += `<button id="${id}" type="button" class="button-toggle btn btn-sm btn-secondary">Expand/Collapse</button></div></div>`;
        html += `<div class="row"><div id="div-${id}" class="col results-wrapper results-wrapper-big visually-hidden"><pre class="${className}">${text}</pre>`;
        html += `<pre class="redText visually-hidden">${text2}</pre>`;
        html += `</div></div>`;
    return html;
}

function addIfNotPresent(array, item) {
    if (!array.includes(item)) {
        array.push(item);
    }
    return array;
}

function buildFilter(jsonArray){
    var status = document.getElementById("container-filter-status");
    var error = document.getElementById("container-filter-error");
    var type = document.getElementById("container-filter-type");
    var group = document.getElementById("container-filter-group");
    status.innerHTML = "";
    error.innerHTML = "";
    type.innerHTML = "";
    group.innerHTML = "";
    var statusItems = []
    var errorTypeItems = []
    var testTypeItems = []
    var testGroupItems = []
    for (let testId in jsonArray) {
        statusItems = addIfNotPresent(statusItems, jsonArray[testId].status);
        errorTypeItems = addIfNotPresent(errorTypeItems, jsonArray[testId].errorType);
        testTypeItems = addIfNotPresent(testTypeItems, jsonArray[testId].typeName);
        testGroupItems = addIfNotPresent(testGroupItems, jsonArray[testId].group);
    }
    status.innerHTML = createChekboxes(statusItems);
    error.innerHTML = createChekboxes(errorTypeItems);
    type.innerHTML = createChekboxes(testTypeItems);
    group.innerHTML = createChekboxes(testGroupItems);
}

function createChekboxes(items){
    var html = "";
    for (let itemId in items) {
        html += `<div class="form-check form-check-inline">`;
        html += `<input class="form-check-input" type="checkbox" id="filter-${items[itemId].replace(/\s+/g, '')}" value="${items[itemId]}" checked>`;
        html += `<label class="form-check-label" for="filter-${items[itemId].replace(/\s+/g, '')}">${items[itemId]}</label></div>`;
    } 
    return html
}

function getCheckedValues(containerId){
    var inputNodes = document.querySelectorAll(`#${containerId} input`);
    var values = [];
    inputNodes.forEach(function(node) {
        if (node.checked) {
            values.push(node.value);
        }
    });
    return values;
}

function filterTable(value, jsonArray){
    var filteredArray = [];
    var statusFilter = getCheckedValues("container-filter-status");
    var errorFilter = getCheckedValues("container-filter-error");
    var typeFilter = getCheckedValues("container-filter-type");
    var groupFilter = getCheckedValues("container-filter-group");
    jsonArray.forEach(function(test) {
        if (!statusFilter.includes(test.status)){
            return;
        }
        if (!errorFilter.includes(test.errorType)){
            return;
        }
        if (!typeFilter.includes(test.typeName)){
            return;
        }
        if (!groupFilter.includes(test.group)){
            return;
        }
        filteredArray.push(test);
    });
    return searchTable(value, filteredArray);
}

function searchTable(value, currentArray) {
    // Keyword search, match if all keywords are found within a item of currentArray
    var searchedArray = [];
    var keywords = value.toLowerCase().split(',');

    currentArray.forEach(function(test) {
        // Check that every keyword matches at least one property of 'test'
        var matchesAllKeywords = keywords.every(function(keyword) {
            return test.name.toLowerCase().includes(keyword) ||
                   test.status.toLowerCase().includes(keyword) ||
                   test.errorType.toLowerCase().includes(keyword) ||
                   test.typeName.toLowerCase().includes(keyword) ||
                   test.group.toLowerCase() == keyword;
        });
        if (matchesAllKeywords) {
            searchedArray.push(test);
        }
    });

    return searchedArray;
}
