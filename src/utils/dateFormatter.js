const dateToFormattedString = (date) => {
    var dateString = `${date}`;
    var date = new Date(dateString);
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    var formattedDate =
        (day < 10 ? "0" + day : day) +
        "-" +
        (month < 10 ? "0" + month : month) +
        "-" +
        year;

    return formattedDate;
};

export default dateToFormattedString;