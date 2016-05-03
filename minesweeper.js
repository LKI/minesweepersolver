var MineGroup = function(x, y, cells, mines) {
  this.x = x;
  this.y = y;
  this.cells = cells;
  this.mines = mines;
}

var dx = [1, 1, 1, 0, -1, -1, -1, 0];
var dy = [1, 0, -1, -1, -1, 0, 1, 1];
var n = 6;
var m = 9;
var mineCount = 0;
var cellType = {
  LOCK : "锁",
  MINE : "地雷",
  SAFE : "点我",
  UNKNOWN : "未知"
}
var debug = [];

function hint(msg) {
  $("#message")[0].className = "lead col-xs-9 bg-success";
  $("#message").html(msg);
}

function warn(msg) {
  $("#message")[0].className = "lead col-xs-9 bg-warning";
  $("#message").html(msg);
}

function error(msg) {
  $("#message")[0].className = "lead col-xs-9 bg-danger";
  $("#message").html(msg);
}

function updateMineCount() {
  mineCount += 1;
  $("#mineCount").html(mineCount);
}

function mark(btn) {
  var mark = $("input[name=mark]:checked").val();
  if ("mine" == mark) {
    if (btn.innerHTML != cellType.MINE) {
      btn.innerHTML = cellType.MINE;
      btn.className = "btn-danger col-xs-1";
      updateMineCount();
    }
  } else if ("lock" == mark) {
    btn.innerHTML = cellType.LOCK;
    btn.className = "btn-warning col-xs-1";
  } else if ("unknown" == mark) {
    btn.innerHTML = cellType.UNKNOWN;
    btn.className = "btn-primary col-xs-1";
  } else {
    btn.className = "btn-default col-xs-1";
    var mineCount = Number(btn.innerHTML);
    if (8 == mineCount) {
      error("每个格子最多也只有8个相邻的格子");
      return;
    } else if (0 <= mineCount && 8 > mineCount) {
      btn.innerHTML = mineCount + 1;
    } else {
      btn.innerHTML = 0;
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

function getSub(cellsA, cellsB) {
  var ca = cellsA.map(function (x) {return x});
  var cb = cellsB.map(function (x) {return x});
  for (var i = 0; i < ca.length; i++) {
    var hasCell = false;
    for (var j = 0; j < cb.length; j++) {
      if (ca[i][0] == cb[j][0] && ca[i][1] == cb[j][1]) {
        hasCell = true;
        cb.splice(j, 1);
        break;
      }
    }
    if (!hasCell) {
      return null;
    }
  }
  return cb;
}

function getInter(cellsA, cellsB) {
  var inter = [];
  var outer = [];
  for (var i = 0; i < cellsA.length; i++) {
    var hasCell = false;
    for (var j = 0; j < cellsB.length; j++) {
      if (cellsA[i][0] == cellsB[j][0] && cellsA[i][1] == cellsB[j][1]) {
        hasCell = true;
        break;
      }
    }
    if (hasCell) {
      inter.push(cellsA[i]);
    } else {
      outer.push(cellsA[i]);
    }
  }
  return [inter, outer];
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
  return new MineGroup(x, y, cells, mines);
}

function refreshMineGroup(mineGroup) {
  var cells = [];
  var mines = mineGroup.mines;
  for (var i = 0; i < mineGroup.cells.length; i++) {
    var x = mineGroup.cells[i][0];
    var y = mineGroup.cells[i][1];
    if (cellType.MINE == getCell(x, y).html()) {
      mines -= 1;
    }
    if (cellType.UNKNOWN == getCell(x, y).html()) {
      cells.push(mineGroup.cells[i]);
    }
  }
  return new MineGroup(mineGroup.x, mineGroup.y, cells, mines);
}

var MineSweeper = function() {
  this.mineMap = new Array(n);
  for (var i = 0; i < n; i++) {
    this.mineMap[i] = [];
  }
};

function setSafe(x, y) {
  var cell = getCell(x,y);
  if (cell.html() != cellType.UNKNOWN && cell.html() != cellType.SAFE) {
    return false;
  }
  cell.html(cellType.SAFE);
  cell[0].className = "btn-success col-xs-1";
  return true;
}

function setMine(x, y) {
  var cell = getCell(x,y);
  if (cell.html() != cellType.UNKNOWN && cell.html() != cellType.MINE) {
    return false;
  }
  cell.html(cellType.MINE);
  cell[0].className = "btn-danger col-xs-1";
  updateMineCount();
  return true;
}

function mineSolve(mineGroups, count) {
  debug.push(mineGroups);
  if (count > 40) {
    return false;
  }
  warn("正在进行第" + count + "次雷区扫描，请稍等...");
  var newGroups = [];
  var solved = false;
  mineGroups = mineGroups.sort(function (a,b) {return a.mines - b.mines || a.cells.length - b.cells.length});
  for (var i = 0; i < mineGroups.length; i++) {
    var mineGroup = mineGroups[i];
    mineGroup = refreshMineGroup(mineGroup);
    var cells = mineGroup.cells;
    var mines = mineGroup.mines;
    if (0 == mines) {
      for (var j = 0; j < cells.length; j++) {
        if (!setSafe(cells[j][0], cells[j][1])) {
          error("地雷阵里好像有数字互相矛盾了！");
          return false;
        }
      }
      solved = true;
    } else if (cells.length == mines) {
      for (var j = 0; j < cells.length; j++) {
        if (!setMine(cells[j][0], cells[j][1])) {
          error("地雷阵里好像有数字互相矛盾了！");
          return false;
        }
      }
    } else {
      var divided = false;
      for (var j = 0; j < i; j++) {
        // 判断雷区是否为子集
        var sub = getSub(mineGroups[j].cells, cells);
        if (null != sub && sub.length > 0) {
          newGroups.push(new MineGroup(mineGroup.x, mineGroup.y, sub, mines - mineGroups[j].mines));
          divided = true;
          break;
        }
        // 判断雷区交集
        var interGroup = getInter(cells, mineGroups[j].cells);
        var inter = interGroup[0];
        var outer = interGroup[1];
        if (outer.length > 0) {
          var maxInterMines = Math.min(inter.length, mineGroups[j].mines);
          if (mines - maxInterMines == outer.length) {
            newGroups.push(new MineGroup(mineGroup.x, mineGroup.y, inter, maxInterMines));
            newGroups.push(new MineGroup(mineGroup.x, mineGroup.y, outer, mines - maxInterMines));
            divided = true;
            break;
          };
          var minInterMines = Math.max(0, inter.length + mineGroups[j].mines - mineGroups[j].cells);
          if (mines - minInterMines == outer.length) {
            newGroups.push(new MineGroup(mineGroup.x, mineGroup.y, inter, mines));
            newGroups.push(new MineGroup(mineGroup.x, mineGroup.y, outer, 0));
            divided = true;
            break;
          }
        }
      }
      if (!divided) {
        newGroups.push(mineGroup);
      }
    }
  }
  console.log(mineGroups, newGroups);
  var diff = (mineGroups.length != newGroups.length);
  for (var i = 0; i < newGroups.length; i++) {
    diff = diff || (newGroups[i].cells.length != mineGroups[i].cells.length);
  }
  if (diff) {
    solved = mineSolve(newGroups, count + 1) || solved;
  }
  if (!solved) {
    warn("根据当前信息不能100%确定地雷位置，你要猜地雷在哪了。");
  }
  return solved;
}

MineSweeper.prototype.analyze = function() {
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < m; j++) {
      if (getCell(i, j).html() == cellType.SAFE) {
        error("请到游戏里面把相应安全位置的格子点开，再来网页里面标记出对应格子。");
        return;
      }
    }
  }
  hint("正在分析中，请稍等...");
  var mineGroups = [];
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < m; j++) {
      var cell = getCell(i, j);
      if (0 <= cell.html() && cell.html() <= 8) {
        var mineGroup = getMineGroup(i, j);
        if (mineGroup.cells.length < mineGroup.mines) {
          error("第" + (i+1) + "行第" + (j+1) + "列的格子错了，扫描不下去。");
          return;
        }
        if (0 < mineGroup.cells.length) {
          mineGroups.push(mineGroup);
        }
      }
    }
  }
  if (mineSolve(mineGroups, 1)) {
    hint("扫描完成，绿色的“点我”格子就是安全的，快去地雷游戏里点开它吧。");
  }
};

function main() {
  var mine = new MineSweeper();
  return mine.analyze();
}

function restart() {
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < m; j++) {
      getCell(i, j)[0].className = "btn-primary col-xs-1";
      getCell(i, j).html(cellType.UNKNOWN);
    }
  }
  mineCount = -1;
  updateMineCount();
  hint("游戏已经重新开始");
}
