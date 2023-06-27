"use server";

export const uploadSheet = async (arr) => {
  //   let counter = 0;
  arr.forEach(async (item) => {
    const payLoad = {
      bill_series: item?.bill,
      bill_date: item?.billDate,
      purc_type: item?.PurcType,
      party_name: item?.partyname,
      ict_eligibility: item?.Eligibility,
      naration: item?.InvoiceNumber,
      item_name: item?.ItemName,
      qty: item?.Quantity,
      unit: item?.unit,
      price: item?.MRP,
      disc: item?.disc,
      amount: item?.TotalAmount,
      cgst: item?.cgst,
      sgst: item?.cgst,
    };
    const options = {
      cache: "no-store",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payLoad),
    };
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbx954UzLaU8Hc0EoOPxKlFowxAcpF4YKP3kb9nkJS5J1IzV4_T6a-2_m9J92FhwoIc/exec",
        options
      );

      if (!response.ok) {
        throw new Error("error in clearing sheet");
      }

      //   const data = await response.text();
      //   console.log("data", data);
      //   if (data?.trim() === "Data saved") {
      //     counter++;
      //   } else {
      //     counter++;
      //   }
    } catch (error) {
      console.log(error);
    }
  });
};

export const clearExcelSheet = async () => {
  const options = {
    cache: "no-store",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: '{"action":"clearAll"}',
  };

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbx954UzLaU8Hc0EoOPxKlFowxAcpF4YKP3kb9nkJS5J1IzV4_T6a-2_m9J92FhwoIc/exec",
      options
    );

    if (!response.ok) {
      throw new Error("error in clearing sheet");
    }

    const data = await response.text();

    if (data?.trim() === "Data cleared") {
      return "200";
    } else {
      return "400";
    }
  } catch (error) {
    console.log(error);
    return "400";
  }
};

export const uploadItem = async (item) => {
  const payload = JSON.stringify(item);

  const options = {
    cache: "no-store",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  };

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbx3G0up1xJoNIJqXLRdmSLQ09OPtwKnTfi8uWPzEw-vCUT4nwvluEmwOA3CKinO6PJhPg/exec",
      options
    );

    const data = await response.text();

    if (data?.trim() === "Data saved") {
      return "200";
    } else {
      return "400";
    }
  } catch (error) {
    console.log(error);
    return "400";
  }
};

export const uploadParty = async (item) => {
  const payload = JSON.stringify({
    party_name: item,
  });

  const options = {
    cache: "no-store",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  };

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbwr8ndVgq8gTbhOCRZChJT8xEOZZCOrjev29Uk6DCDLQksysu80oTb8VSnoZMsCQa3g/exec",
      options
    );

    const data = await response.text();

    if (data?.trim() === "Data saved") {
      return "200";
    } else {
      return "400";
    }
  } catch (error) {
    console.log(error);
    return "400";
  }
};
