var MineGroup = function(cells, mines) {
  this.cells = cells;
  this.mines = mines;
}

MineGroup.prototype.getCells = function() {
  return this.cells;
}

MineGroup.prototype.getMines = function() {
  return this.mines;
}

var dx = [1, 1, 1, 0, -1, -1, -1, 0];
var dy = [1, 0, -1, -1, -1, 0, 1, 1];
var n = 6;
var m = 9;
var cellType = {
  LOCK : "锁",
  MINE : "地雷",
  UNKNOWN : "未知"
}

function hint(msg) {
  $("#message")[0].className = "lead col-md-9 bg-success";
  $("#message").html(msg);
}

function warn(msg) {
  $("#message")[0].className = "lead col-md-9 bg-warning";
  $("#message").html(msg);
}

function error(msg) {
  $("#message")[0].className = "lead col-md-9 bg-danger";
  $("#message").html(msg);
}

function mark(btn) {
  var mark = $("input[name=mark]:checked").val();
  if ("mine" == mark) {
    btn.innerHTML = cellType.MINE;
    btn.className = "btn-danger col-md-1";
  } else if ("lock" == mark) {
    btn.innerHTML = cellType.LOCK;
    btn.className = "btn-warning col-md-1";
  } else if ("unknown" == mark) {
    btn.innerHTML = cellType.UNKNOWN;
    btn.className = "btn-primary col-md-1";
  } else {
    btn.className = "btn-default col-md-1";
    if (cellType.UNKNOWN == btn.innerHTML || cellType.MINE == btn.innerHTML || cellType.LOCK == btn.innerHTML) {
      btn.innerHTML = 0;
    } else {
      var mineCount = Number(btn.innerHTML);
      if (8 == mineCount) {
        error("每个格子最多也只有8个相邻的格子");
        return;
      } else {
        btn.innerHTML = mineCount + 1;
      }
    }
  }
  hint("已经将格子标记为" + btn.innerHTML + "，继续点击可以继续标记（若是继续标记数字则会 +1 ）");
}

function getCell(x, y) {
  return $("#i" + (x+1) + "j" + (y+1));
}

function inRange(x, y) {
  if (0 > x || n <= x || 0 > y || m <= y) {
    return false;
  } else {
    return true;
  }
}

function getMineGroup(x, y) {
  var cells = [];
  var mines = Number(getCell(x, y).html());
  for (var i = 0; i < 8; i++) {
    var nx = x + dx[i];
    var ny = y + dy[i];
    if (inRange(nx, ny)) {
      var cell = getCell(nx, ny);
      if (cellType.MINE == cell.html()) {
        mines -= 1;
      }
      if (cellType.UNKNOWN == cell.html()) {
        cells.push([nx, ny]);
      }
    }
  }
  return new MineGroup(cells, mines);
}

var MineSweeper = function() {
  this.mineMap = new Array(n);
  for (var i = 0; i < n; i++) {
    this.mineMap[i] = [];
  }
};

MineSweeper.prototype.analyze = function() {
  hint("正在分析中，请稍等...");
  var mineGroups = [];
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < m; j++) {
      var cell = getCell(i, j);
      if (0 <= cell.html() && cell.html() <= 8) {
        var mineGroup = getMineGroup(i, j);
        if (mineGroup.getCells().length < mineGroup.getMines()) {
          error("第" + (i+1) + "行第" + (j+1) + "列的格子错了，扫描不下去。");
          return;
        }
        if (0 < mineGroup.getCells().length) {
          mineGroups.push(mineGroup);
        }
      }
    }
  }
  return mineGroups;
};

function main() {
  var mine = new MineSweeper();
  return mine.analyze();
}
