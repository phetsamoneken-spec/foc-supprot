/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MKT CUSTOMER BUDGET MANAGEMENT - GOOGLE APPS SCRIPT WEB APP BACKEND
 * Spreadsheet ID: 1hMjeyC_Xizwj3ca67dGR0To1oGJGTw3VivFnT_o-76A
 * Teams Supported: B1, B2, B3, B4, B5, B6, B7
 */

const SPREADSHEET_ID = "1hMjeyC_Xizwj3ca67dGR0To1oGJGTw3VivFnT_o-76A";

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "ping";

    if (action === "ping") {
      return jsonResponse({
        success: true,
        message: "MKT Customer Budget Management Web App Backend Active",
        timestamp: new Date().toISOString(),
        spreadsheetId: SPREADSHEET_ID
      });
    }

    if (action === "getCustomers") {
      const team = (e.parameter && e.parameter.team) || "ALL";
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName("CUSTOMERS");
      if (!sheet) {
        return jsonResponse({ success: false, message: "CUSTOMERS sheet not found" });
      }
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const customers = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue;
        if (team !== "ALL" && row[2] !== team) continue;
        customers.push({
          code: row[0],
          name: row[1],
          team: row[2],
          mde: row[3],
          phone: row[4],
          address: row[5],
          province: row[6],
          status: row[7],
          createdAt: row[8]
        });
      }
      return jsonResponse({ success: true, count: customers.length, data: customers });
    }

    return jsonResponse({ success: false, message: "Unknown action" });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Handle HTTP POST Requests with Concurrency Lock
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Wait up to 10 seconds to prevent concurrent write collisions
    lock.waitLock(10000);

    let postData = {};
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else {
      return jsonResponse({ success: false, message: "No post data received" });
    }

    const action = postData.action;
    const payload = postData.payload || {};

    let result = { success: false, message: "Unknown action" };

    switch (action) {
      case "ADD_TRANSACTION":
        result = handleAddTransaction(payload);
        break;
      case "CANCEL_TRANSACTION":
        result = handleCancelTransaction(payload);
        break;
      case "NEW_CONTRACT_CYCLE":
        result = handleNewContractCycle(payload);
        break;
      case "UPDATE_BUDGET":
        result = handleUpdateBudget(payload);
        break;
      case "SYNC_BULK_DATA":
        result = handleBulkSync(payload);
        break;
      default:
        result = { success: false, message: "Unsupported action: " + action };
    }

    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function handleAddTransaction(p) {
  const ss = getSpreadsheet();
  const txnSheet = ss.getSheetByName("BUDGET_TRANSACTIONS");
  const budgetSheet = ss.getSheetByName("BUDGETS");
  const logSheet = ss.getSheetByName("ACTIVITY_LOG");

  if (!txnSheet) return { success: false, message: "BUDGET_TRANSACTIONS sheet not found" };

  txnSheet.appendRow([
    p.id,
    p.date,
    p.customerCode,
    p.customerName,
    p.team,
    p.contractId,
    p.budgetId,
    p.category,
    p.description,
    p.amount,
    p.invoiceRef || "",
    p.createdBy,
    new Date(),
    "ACTIVE",
    ""
  ]);

  if (logSheet) {
    logSheet.appendRow([
      "LOG-" + Date.now(),
      new Date(),
      p.createdBy,
      "USER",
      p.team,
      "ADD_TRANSACTION",
      "Recorded " + p.amount + " for " + p.customerName + " (" + p.category + ")"
    ]);
  }

  return { success: true, message: "Transaction added successfully", id: p.id };
}

function handleCancelTransaction(p) {
  const ss = getSpreadsheet();
  const txnSheet = ss.getSheetByName("BUDGET_TRANSACTIONS");
  const logSheet = ss.getSheetByName("ACTIVITY_LOG");
  if (!txnSheet) return { success: false, message: "Sheet not found" };

  const data = txnSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(p.txnId)) {
      txnSheet.getRange(i + 1, 14).setValue("CANCELLED");
      txnSheet.getRange(i + 1, 15).setValue(p.reason || "Cancelled by user");
      
      if (logSheet) {
        logSheet.appendRow([
          "LOG-" + Date.now(),
          new Date(),
          p.cancelledBy || "user",
          "USER",
          p.team || "ALL",
          "CANCEL_TRANSACTION",
          "Cancelled transaction " + p.txnId + " - Reason: " + (p.reason || "None")
        ]);
      }
      return { success: true, message: "Transaction cancelled" };
    }
  }

  return { success: false, message: "Transaction ID not found" };
}

function handleNewContractCycle(p) {
  const ss = getSpreadsheet();
  const contractSheet = ss.getSheetByName("CONTRACTS");
  const budgetSheet = ss.getSheetByName("BUDGETS");
  const logSheet = ss.getSheetByName("ACTIVITY_LOG");

  if (!contractSheet || !budgetSheet) {
    return { success: false, message: "Required sheets not found" };
  }

  const contractId = "CNT-" + p.customerCode + "-" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd");
  const budgetId = "BDG-" + p.customerCode + "-" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd");

  contractSheet.appendRow([
    contractId,
    p.customerCode,
    p.customerName,
    p.team,
    p.commencingOn,
    p.expiringOn,
    p.cycleNumber || 2,
    "ACTIVE",
    p.notes || "New contract cycle",
    new Date()
  ]);

  budgetSheet.appendRow([
    budgetId,
    contractId,
    p.customerCode,
    p.team,
    p.annualAmount || 0,
    0,
    p.annualAmount || 0,
    0,
    "NORMAL",
    false,
    "",
    new Date()
  ]);

  if (logSheet) {
    logSheet.appendRow([
      "LOG-" + Date.now(),
      new Date(),
      p.createdBy || "admin",
      "ADMIN",
      p.team,
      "NEW_CONTRACT_CYCLE",
      "Created cycle for " + p.customerName + " with annual budget " + p.annualAmount
    ]);
  }

  return { success: true, message: "Contract cycle activated", contractId, budgetId };
}

function handleUpdateBudget(p) {
  const ss = getSpreadsheet();
  const budgetSheet = ss.getSheetByName("BUDGETS");
  if (!budgetSheet) return { success: false, message: "BUDGETS sheet not found" };

  const data = budgetSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(p.budgetId)) {
      budgetSheet.getRange(i + 1, 5).setValue(p.newAmount);
      const used = Number(data[i][5]) || 0;
      const rem = Number(p.newAmount) - used;
      budgetSheet.getRange(i + 1, 7).setValue(rem);
      budgetSheet.getRange(i + 1, 8).setValue(p.newAmount > 0 ? (used / p.newAmount) * 100 : 0);
      budgetSheet.getRange(i + 1, 12).setValue(new Date());
      return { success: true, message: "Budget updated" };
    }
  }

  return { success: false, message: "Budget ID not found" };
}

function handleBulkSync(p) {
  return {
    success: true,
    message: "Sync handshake confirmed with spreadsheet ID: " + SPREADSHEET_ID,
    syncedAt: new Date().toISOString()
  };
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
