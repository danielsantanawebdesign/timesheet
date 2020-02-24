moment.locale("pt-br");

var toHHMMSS = secs => {
  var sec_num = parseInt(secs, 10);
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor(sec_num / 60) % 60;
  //var seconds = sec_num % 60;

  return (
    [hours, minutes]
      .map(v => (v < 10 ? "0" + v : v))
      //.filter((v, i) => v !== "00" || i > 0)
      .join(":")
  );
};

new Vue({
  el: "#app",
  data() {
    return {
      employees: [],
      days: [],
      loading: true,
      error: false
    };
  },
  mounted() {
    axios
      .get("https://s3-sa-east-1.amazonaws.com/lar21css/desafio_frontend.json")
      .then(response => {
        this.employees = response.data.employees;
        this.days = response.data.days;

        _.map(this.days, (day, index) => {
          day.employee = _.find(this.employees, { id: day.employee });
          day.hourWork = 0;
          day.hourPause = 0;
          var interval1 = 0;
          var interval2 = 0;

          var pontosLen = day.pontos.length;
          day.pontos = _.concat(
            day.pontos,
            _.fill(Array(4 - pontosLen), { time: null, kind: "" })
          );

          //Validando primeiro intervalo de datas ( horas trabalhadas )
          if (
            day.pontos[0] &&
            day.pontos[1] &&
            moment(day.pontos[0].time).isValid() &&
            moment(day.pontos[1].time).isValid()
          )
            interval1 = moment
              .utc(moment(day.pontos[1].time).diff(moment(day.pontos[0].time)))
              .format("HH:mm:ss");

          //Validando segundo intervalo de datas ( horas da pausa )
          if (
            day.pontos[2] &&
            day.pontos[1] &&
            moment(day.pontos[2].time).isValid() &&
            moment(day.pontos[1].time).isValid()
          ) {
            day.hourPause = moment
              .utc(moment(day.pontos[2].time).diff(moment(day.pontos[1].time)))
              .format("HH:mm");
          } else {
            day.hourPause = toHHMMSS(0);
          }

          //Validando terceiro intervalo de datas ( horas trabalhadas )
          interval2 = 0;
          if (
            day.pontos[3] &&
            day.pontos[2] &&
            moment(day.pontos[3].time).isValid() &&
            moment(day.pontos[2].time).isValid()
          ) {
            interval2 = moment
              .utc(moment(day.pontos[3].time).diff(moment(day.pontos[2].time)))
              .format("HH:mm:ss");
          }

          //Somando intervalos e convertendo hora
          day.hourWork = toHHMMSS(
            moment
              .duration(interval1)
              .add(interval2)
              .asSeconds()
          );
        });
      })
      .catch(error => {
        this.error = true;
      })
      .finally(() => (this.loading = false));
  }
});

Vue.filter("formatDate", function(value) {
  if (moment(String(value)).isValid()) {
    return moment(String(value)).format("MM/DD/YYYY - dddd");
  } else {
    return "";
  }
});

Vue.filter("formatHour", function(value) {
  if (moment(String(value)).isValid()) {
    return moment(String(value)).format("hh:mm");
  } else {
    return "";
  }
});
