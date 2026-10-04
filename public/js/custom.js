  // http://localhost:3000/ production
  // https://five1trading.onrender.com/ production

  document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('.tableBody');
    if (!tableBody) return;

    new Sortable(tableBody, {
        handle: '.drag-handle',
        animation: 150,
        onEnd: function () {
            renumberRowIndices();
            addTotal();
        }
    });
});

function renumberRowIndices() {
    const rows = document.querySelectorAll('.tableBody .table-row');
    rows.forEach((row, index) => {
        row.querySelectorAll('[name]').forEach(input => {
            input.name = input.name.replace(/items\[\d+\]/, `items[${index}]`);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {

    // Check if scanned MPN Input exists
    const scannedMpnInput = document.querySelector("#selectedMPN");
    if (!scannedMpnInput) {
        return; // Exit if scanned MPN Input doesn't exist
    }
    scannedMpnInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // console.log('You have hit Enter on your keypad and the MPN is: ' + scannedMpnInput.value);
            // console.log(e.key);
            addProduct2(e);
            scannedMpnInput.value = ''; // Clears the field for the next scan
        } else {
            // All other keys work normally
            return true;
          }
    })
})
// sign invoice event listener
document.addEventListener('DOMContentLoaded', () => {

    const signInvoiceBtn = document.querySelector('#signInvoiceBtn');
    const signInvoiceContainer = document.querySelector('#signInvoiceContainer')
   

    if (!signInvoiceBtn || !signInvoiceContainer) {
        return;
    }

    signInvoiceBtn.addEventListener('click', signInvoice);

})

const signInvoice = (e) => {
    console.log('invoice signing pad opened');
    signInvoiceContainer.classList.remove('hide');
    signInvoiceContainer.classList.add('show');
}
// Copy Invoice event listener
document.addEventListener('DOMContentLoaded', () => {

    const copyInvoiceBtn = document.querySelector('#copyInvoiceBtn');
   

    if (!copyInvoiceBtn) {
        return;
    }

    copyInvoiceBtn.addEventListener('click', copyInvoice);

})
// print invoice event listener
document.addEventListener('DOMContentLoaded', () => {
    const printInvoiceBtn = document.querySelector('#printInvoiceBtn')

    if (!printInvoiceBtn) {
        return;
    }

    printInvoiceBtn.addEventListener('click', printInvoice)
})

const printInvoice = (e) => {
    console.log('invoice is being printed!');
    window.print();
}
// copy invoice event listener
const copyInvoice = (e) => {
    console.log('this is a copy test');
    const invoiceId = document.querySelector('h2.page-header').dataset.invoiceid;
    console.log(invoiceId);
    fetch(`/invoices/${invoiceId}/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
        // Add body if you need to send data
        // body: JSON.stringify({ customer: newCustomerId })
      })
      .then((response) => response.json() )
      .then((data) => {
        // console.log(data);
        window.location.href = `/invoices/${data._id}`;
      })    
}

// search product event listener
document.addEventListener('DOMContentLoaded', () => {

   const searchProductInput = document.querySelector('#searchProductInput');
   const searchProductBtn = document.querySelector('#searchProductBtn')
   let searchResults = document.querySelector("select#selectedProduct");
//    console.log(searchResults);

   if (!searchProductInput || !searchProductBtn || !searchResults) {
    console.log("select input not found");
    return; // Exit if scanned MPN Input doesn't exist
    }
    

    searchProductBtn.addEventListener('click', getSearchResults);
    searchProductInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            getSearchResults(e);
        } else {
            // All other keys work normally
            return true;
          }
    });
})


//event listener for selecting quantity on focus

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('.tableBody');
    if (!tableBody) {
        return;
    }

    tableBody.addEventListener('focus', function(e) {
        if (e.target.classList.contains('quantity')) {
            setTimeout(() => e.target.select(), 0);
        }
    }, true);
}); // "true" enables capture phase, needed because focus doesn't bubble

    const getSearchResults = (e) => {
        e.preventDefault();
        let searchedProduct = searchProductInput.value;
        let searchResults = document.querySelector("select#selectedProduct");

        searchProductInput.value = ""; // clear it right away

        fetch(`/products/${searchedProduct}/search/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((response) => response.json())
        .then((data) => {
            
            if (data.errorMessage) {
                // alert(data.errorMessage);
                console.log(data.errorMessage);
                return;
            } else {
                searchResults.innerHTML = "";
                data.products.forEach(product => {
                    option = document.createElement("option");
                    option.label = product.itemNumber + " - " + product.description;
                    option.dataset.id = product._id;
                    option.dataset.itemnumber = product.itemNumber;
                    option.dataset.mpn = product.mpn;
                    option.value = product._id;
                    searchResults.appendChild(option);
                })
                
            }
        });
    }

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.header-nav > ul');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    })

    // Check if signature pad canvas exists
    const canvas = document.getElementById("signature-pad");
    if (!canvas) {
        return; // Exit if canvas doesn't exist
    }

    // Only try to get invoice ID if the canvas exists
    const headerElement = document.querySelector('H2.page-header');
    if (!headerElement) {
        console.error('Header element not found');
        return;
    }
    
    const invoiceId = headerElement.dataset.invoiceid;
    const customerSignatureImage = document.getElementById("customerSignature");
    
    // Initialize SignaturePad
    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: "rgba(255, 255, 255, 0)",
        penColor: "rgb(0, 0, 0)",
    });

    // Get button elements
    const saveButton = document.getElementById("save");
    const cancelButton = document.getElementById("clear");
    const signatureInput = document.getElementById("signatureInput");
    const signInvoiceContainer = document.querySelector('#signInvoiceContainer');

    // Verify all required elements exist
    if (!saveButton || !cancelButton || !signatureInput || !customerSignatureImage || !signInvoiceContainer) {
        console.error('Required elements not found');
        return;
    }

    // Add save button event listener
    saveButton.addEventListener("click", function (e) {
        e.preventDefault();
        const data = signaturePad.toDataURL("image/png");
        
        customerSignatureImage.src = data;
        signatureInput.value = data;
        
        const updatedSignature = {
            signature: customerSignatureImage.src
        };
        
        signaturePad.clear();

        // fetch updating the signature
      
        //  development
        fetch(`/invoices/${invoiceId}/signature`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedSignature),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // console.log("Updated signature response:", data);
        })
        .catch(error => {
            console.error("Error:", error);
        });

        signInvoiceContainer.classList.remove("show");
        signInvoiceContainer.classList.add("hide");

    });

    // Add clear button event listener
    cancelButton.addEventListener("click", function (e) {
        e.preventDefault();
        signaturePad.clear();
    });
});

const addProductMPN = document.querySelector("#addProductMPN"); // Added variable definition
let productList = document.querySelector("#productList");
let addProductButton = document.querySelector("#addProduct");

function bcRender() {
    let svg = document.querySelectorAll(".barcode");

    svg.forEach(function (item) {
        let upcId = "#" + item.id;
        let mpn = item.dataset.mpn;

        if (mpn !== "" && mpn !== null) {
            // JsBarcode(upcId, mpn, { format: "ean13" });
            JsBarcode(upcId, mpn, {
                format: 'CODE128',
                width: 1.5,
                height: 20, // Shorter barcode height
                displayValue: false, // Remove text display
                margin: 0 });
        }
        
    });
}

bcRender();

const addProduct2 = (e) => {
    e.preventDefault();
    let scannedMPN = document.querySelector("#selectedMPN").value;

    fetch(`/invoices/${scannedMPN}/addproductbympn`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.errorMessage) {
                console.log(data.errorMessage);
                return;
            }
            addItem(data.product, data.product.itemNumber);
            if (data.crvProduct) {
                addItem(data.crvProduct, data.crvProduct.itemNumber);
            }
        });
};

const addProduct = (e) => {
    e.preventDefault();
    let productSelect = document.querySelector("#selectedProduct");
    let selectIndex = productSelect.selectedIndex;
    let productId = document.querySelector("#selectedProduct").value;
    let selectedProduct = productSelect[selectIndex];
    let productItemNumber = selectedProduct.dataset.itemnumber;

    fetch(`/invoices/${productId}/addproductbyid`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.errorMessage) {
                console.log(data.errorMessage);
                return;
            }
            addItem(data.product, data.product.itemNumber);
            if (data.crvProduct) {
                addItem(data.crvProduct, data.crvProduct.itemNumber);
            }
        })
        .catch((error) => console.error("Fetch error:", error));
};

// addProduct was already defined for the button
function addItem(data, productItemNumber){
    products = document.querySelectorAll(".itemNumber");
    const productsArray = Array.from(products);
    let productIndex = productsArray.length;

    for (i = 0; i < products.length; i++) {
        if (data.itemNumber === productsArray[i].id) {
            let duplicatePrice = document.querySelector("[data-" + data.itemNumber + "price]");
            let duplicateQty = document.querySelector("[data-" + data.itemNumber + "qty]");
            let duplicateSubTotal = document.querySelector("[data-" + data.itemNumber + "subtotal]");
            duplicateQty.value = Number(duplicateQty.value) + 1;
            productTotal = duplicatePrice.value * duplicateQty.value;
            duplicateSubTotal.value = productTotal;
            addTotal();
            return;
        }
    }

    const tableBody = document.querySelector(".tableBody");
    const row = document.createElement("tr");
    row.classList.add("table-row");
    const actions = document.createElement("div");
    actions.classList.add("actions");

    for (let i = 0; i < 11; i++) {
        const td = document.createElement("td");

        switch (i) {
            case 0: // drag handle
                td.classList.add("drag-handle");
                input = document.createElement("span");
                input.innerHTML = "☰";
                break;

            case 1: // source
                input = document.createElement("input");
                input.type = "text";
                input.name = `items[${productIndex}][source]`;
                input.classList.add("source");
                break;

            case 2: // mpn
                input = document.createElement("input");
                input.type = "text";
                input.dataset[data.mpn + "mpn"] = data.mpn;
                input.name = `items[${productIndex}][mpn]`;
                input.classList.add("mpn");
                input.id = data._id;
                input.value = data.mpn;
                input.readOnly = true;
                break;

            case 3: // Item Number
                input = document.createElement("input");
                input.type = "text";
                input.name = `items[${productIndex}][itemNumber]`;
                input.classList.add("itemNumber");
                input.id = data.itemNumber;
                input.value = data.itemNumber;
                input.readOnly = true;

                const productIdInput = document.createElement("input");
                productIdInput.type = "hidden";
                productIdInput.classList.add("productId");
                productIdInput.name = `items[${productIndex}][productId]`;
                productIdInput.value = data._id || '';
                td.appendChild(productIdInput);
                break;

            case 4: // description
                input = document.createElement("input");
                input.type = "text";
                input.name = `items[${productIndex}][description]`;
                input.id = data._id;
                input.classList.add("description");
                input.value = data.description;
                td.classList.add('description');
                break;

            case 5: // price
                input = document.createElement("input");
                input.type = "text";
                input.setAttribute(`data-${data.itemNumber}price`, data.itemNumber);
                input.name = `items[${productIndex}][price]`;
                input.classList.add("price");
                input.value = parseFloat(data.price).toFixed(2);
                break;

            case 6: // quantity
                input = document.createElement("input");
                input.type = "number";
                input.name = `items[${productIndex}][quantity]`;
                input.setAttribute(`data-${data.itemNumber}qty`, data.itemNumber);
                input.classList.add("quantity");
                input.placeholder = 1;
                input.value = parseFloat(1);
                break;

            case 7: // sub total
                input = document.createElement("input");
                input.type = "text";
                input.setAttribute(`data-${data.itemNumber}subtotal`, data.itemNumber);
                input.name = `items[${productIndex}][subTotal]`;
                input.classList.add("subTotal");
                input.readOnly = true;

                const price = parseFloat(data.price);
                const quantity = 1;
                if (isNaN(price) || isNaN(quantity)) {
                    console.error("Invalid input: price or quantity is not a valid number.");
                } else {
                    input.value = (price * quantity).toFixed(2);
                }
                break;

            case 8: // notes
                input = document.createElement("input");
                input.type = "text";
                input.name = `items[${productIndex}][notes]`;
                input.classList.add("notes");
                input.placeholder = "Enter Notes Here";
                input.value = "Notes";
                td.classList.add('notes');
                break;

            case 9: // done button
                input = document.createElement("input");
                input.type = "checkbox";
                input.name = `items[${productIndex}][status]`;
                input.value = "false";
                input.classList.add("done");
                input.id = `doneCheckbox_${productIndex}`;
                td.appendChild(input);
                break;

            case 10: // remove button
                input = document.createElement("button");
                input.type = "button";
                input.classList.add("btn");
                input.classList.add("btn-danger");
                input.innerHTML = "X";
                td.classList.add('action-cell');
                break;
        }
        addTotal();

        actions.appendChild(td);
        td.appendChild(input);
        row.appendChild(td);
        tableBody.appendChild(row);
    }

    renumberRowIndices();
}

function renderBarcode(){
  // Define the SVG namespace
  const svgNamespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNamespace, "svg");
  // const textNode = document.createTextNode(data.description + ' ' + data.price);

  // Add id class and dataset to svg and get the upc id and mpn to render the svg
  svg.id = "id" + data.mpn; // Can't start ID name with a number, so we use id + number
  svg.classList.add("barcode"); // Corrected this line
  svg.dataset.mpn = data.mpn;
  let upcId = "#" + svg.id; // id of div to render svg
  let mpn = svg.dataset.mpn; //mpn number to render the barcode

  // render the svg barcode in the upcId div with the mpn number
  JsBarcode(upcId, mpn, {
    format: 'CODE128',
    width: 1.5,
    height: 20, // Shorter barcode height
    displayValue: false, // Remove text display
    margin: 0 });
}


addProductButton.addEventListener("click", addProduct);
addProductMPN.addEventListener("click", addProduct2);



// Add event listener to the container of the product list
productList.addEventListener("click", function (e) {
    if (e.target && e.target.matches(".btn-danger")) {
        const tableRow = e.target.closest(".table-row");
        const itemNumberInput = tableRow.querySelector(".itemNumber");
        const itemNumber = itemNumberInput ? itemNumberInput.value : null;

        tableRow.remove();

        // If this was a beverage row (not a CRV row itself), remove its linked CRV row too
        if (itemNumber && !itemNumber.startsWith('CRV-')) {
            document.querySelectorAll(".itemNumber").forEach(input => {
                if (input.value.startsWith('CRV-') && input.value.endsWith(`-${itemNumber}`)) {
                    const crvRow = input.closest(".table-row");
                    if (crvRow) crvRow.remove();
                }
            });
        }
        renumberRowIndices();
        addTotal();
    }
});

// quantity change listener (with CRV sync)
productList.addEventListener("change", function (e) {
    if (e.target && e.target.matches(".quantity")) {
        const tableRow = e.target.closest(".table-row");
        const beverageItemNumber = tableRow.querySelector(".itemNumber").value;
        const price = parseFloat(tableRow.querySelector(".price").value);
        const quantity = parseInt(e.target.value, 10);
        const subTotal = tableRow.querySelector(".subTotal");
        subTotal.value = (price * quantity).toFixed(2);

        // Find and sync any CRV row linked to this beverage (itemNumber ends in "-<beverageItemNumber>")
        document.querySelectorAll(".itemNumber").forEach(input => {
            if (input.value.startsWith('CRV-') && input.value.endsWith(`-${beverageItemNumber}`)) {
                const crvRow = input.closest(".table-row");
                const crvPrice = parseFloat(crvRow.querySelector(".price").value);
                const crvQtyInput = crvRow.querySelector(".quantity");
                const crvSubTotal = crvRow.querySelector(".subTotal");
                crvQtyInput.value = quantity;
                crvSubTotal.value = (crvPrice * quantity).toFixed(2);
            }
        });

        addTotal();
    }
});

// price change listener
productList.addEventListener("change", function (e) {
    if (e.target && e.target.matches(".price")) {
        const tableRow = e.target.closest(".table-row");
        const price = parseFloat(e.target.value) || 0;
        const quantityInput = tableRow.querySelector(".quantity");
        const quantity = parseInt(quantityInput.value, 10) || 0;
        const subTotal = tableRow.querySelector(".subTotal");
        subTotal.value = (price * quantity).toFixed(2);

        addTotal();
    }
});

// Add event listener to the container of the product list
productList.addEventListener("change", function (e) {
    // Check if the element that changed is the checkbox element
    if (e.target && e.target.matches(".done")) {
        // get the row
        let tableRow = e.target.closest(".table-row");
        let checkbox = tableRow.querySelector(".done");
        if (checkbox.checked) {
            console.log("Checkbox is checked!");
            tableRow.classList.add("done");
            checkbox.value = true;
        } else {
            tableRow.classList.remove("done");
            console.log("Checkbox is unchecked!");
            checkbox.value = false;
        }
    }
});

// function to add total
function addTotal() {
    let amounts = document.querySelectorAll(".subTotal");
    let total = document.querySelector("#totalSum");
    let sum = 0;
    if (amounts.length === 0) {
        total.value = "0.00";
        return;
    }
    amounts.forEach(function (item) {
        sum += parseFloat(item.value) || 0;
    });
    total.value = sum.toFixed(2);
}

// sorting of columns start here

// Function to sort the table rows based on a given column index
function sortTable(n, isCheckbox = false) {
    let table = document.querySelector("table");
    let rows = Array.from(table.rows).slice(1); // Skip header row
    let sortedRows;

    if (isCheckbox) {
        // Sorting for Done Status (checkbox)
        sortedRows = rows.sort((a, b) => {
            let aChecked = a.cells[n].querySelector("input[type='checkbox']").checked;
            let bChecked = b.cells[n].querySelector("input[type='checkbox']").checked;
            return aChecked - bChecked; // Sort by checked status (false -> 0, true -> 1)
        });
    } else {
        // Sorting for Source (text) column
        sortedRows = rows.sort((a, b) => {
            let aText = a.cells[n].querySelector("input[type='text']").value.toLowerCase();
            let bText = b.cells[n].querySelector("input[type='text']").value.toLowerCase();
            return aText.localeCompare(bText); // Sort by alphabetic order
        });
    }

    // Reorder the rows in the table
    table.tBodies[0].innerHTML = ""; // Clear existing rows
    table.tBodies[0].append(...sortedRows); // Append sorted rows
}

// Add click event listener for Source column sorting
document.getElementById("source-header").addEventListener("click", () => {
    sortTable(1); // was 0, now shifted by the new drag column
});

// Add click event listener for Done Status column sorting
document.getElementById("status-header").addEventListener("click", () => {
    sortTable(9, true); // was 8
});
