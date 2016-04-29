var n = 6;
var m = 9;

var MineSweeper = function () {
  this.mineMap = new Array(n);
  for (var i = 0; i < n; i++) {
    this.mineMap[i] = [];
  }
};

MineSweeper.prototype.init = function() {
  console.log("Initilizing");
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < m; j++) {
      var cell = $("#i"+(i+1)+"j"+(j+1));
      this.mineMap[i][j] = cell.val() || "";
      if ("" != this.mineMap[i][j]) {
        cell.val("test");
      }
    }
  }
};

MineSweeper.prototype.analyze = function() {
  console.log("Analyzing");
};

function main() {
  var mine = new MineSweeper();
  mine.init();
  mine.analyze();
}

function mark(btn) {
  var mark = $("input[name=mark]:checked").val();
  if ("mine" == mark) {
    btn.innerHTML = "地雷";
    btn.className = "btn-danger col-md-1";
  } else if ("lock" == mark) {
    btn.innerHTML = "锁";
    btn.className = "btn-warning col-md-1";
  } else {
    btn.className = "btn-primary col-md-1";
    if ("未知" == btn.innerHTML || "地雷" == btn.innerHTML || "锁" == btn.innerHTML) {
      btn.innerHTML = 0;
    } else {
      var mineCount = Number(btn.innerHTML);
      if (8 == mineCount) {
        $("#message").html("友情提示：每个格子里数字最多是8");
      } else {
        btn.innerHTML = mineCount + 1;
      }
    }
  }
}
