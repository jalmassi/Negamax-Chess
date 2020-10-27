$(function() {
	init();
	console.log("Main Init Called");
	NewGame(START_FEN);
});

function InitFilesRanksBrd() {

	var index = 0;
	var file = FILES.FILE_A;
	var rank = RANKS.RANK_1;
	var sq = SQUARES.A1;

	for(index = 0; index < BRD_SQ_NUM; ++index) { //set all files/ranks=100
		FilesBrd[index] = SQUARES.OFFBOARD;
		RanksBrd[index] = SQUARES.OFFBOARD;
	}

	for(rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) { //files/rankbrd=file/rank
		for(file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
			sq = FR2SQ(file,rank);
			FilesBrd[sq] = file;
			RanksBrd[sq] = rank;
		}
	}
}

function InitHashKeys() {
    var index = 0;

	for(index = 0; index < 14 * 120; ++index) {
		PieceKeys[index] = randomize();
	}

	SideKey = randomize();

	for(index = 0; index < 16; ++index) {
		CastleKeys[index] = randomize();
	}
}

function InitSq120To64() {

	var index = 0;
	var file = FILES.FILE_A;
	var rank = RANKS.RANK_1;
	var sq = SQUARES.A1;
	var sq64 = 0;

	for(index = 0; index < BRD_SQ_NUM; ++index) {
		Sq120ToSq64[index] = 65;
	}

	for(index = 0; index < 64; ++index) {
		Sq64ToSq120[index] = 120;
	}

	for(rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
		for(file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
			sq = FR2SQ(file,rank);
			Sq64ToSq120[sq64] = sq;
			Sq120ToSq64[sq] = sq64;
			sq64++;
		}
	}

}

function InitBoardVars() { //history + movePosKey reset

	var index = 0;
	for(index = 0; index < MAXGAMEMOVES; ++index) {
		game.history.push( {
			move : NOMOVE,
			castlePerm : 0,
			enPas : 0,
			fiftyMove : 0,
			posKey : 0
		});
	}

	for(index = 0; index < PVENTRIES; ++index) {
		game.movePosKey.push({
			move : NOMOVE,
			posKey : 0
		});
	}
}

function InitBoardSquares() {
	var light = true;
	var rankName;
	var fileName;
	var divString;
	var rank = 0;
	var file = 0;
	var lightString;

	for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		light = !light;
		rankName = "rank" + (rank+1);
		for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			fileName = "file" + (file+1);

			if(light==0) lightString="Light";
			else lightString = "Dark";
			divString = "<div class=\"Square " + rankName + " " + fileName + " " + lightString + "\"/>";
			light^=1;
			$("#Board").append(divString);
 		}
 	}
}

function InitBoardSquares() {
	var light = 1;
	var rankName;
	var fileName;
	var divString;
	var rank;
	var file;
	var lightString;

	for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		light = !light;
		rankName = "rank" + (rank + 1);
		for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			fileName = "file" + (file + 1);
			if(light == 0) lightString="bg-light";
			else lightString = "bg-info";
			light^=1;
			divString = "<div class=\"gamecell Square " + rankName + " " + fileName + " " + lightString + "\"/>";
			$("#Board").append(divString);
		}
	}

}

var mostLeastValueValue = [ 0, 100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600 ];
var mostLeastValueScores = new Array(14 * 14);

function InitmostLeastValue() {
	var capturer;
	var captured;

	for(capturer = PIECES.wP; capturer <= PIECES.bK; ++capturer) {
		for(captured = PIECES.wP; captured <= PIECES.bK; ++captured) {
			mostLeastValueScores[captured * 14 + capturer] = mostLeastValueValue[captured] + 6 - (mostLeastValueValue[capturer]/100);
		}
	}

}

function init() {
	console.log("init() called");
	InitFilesRanksBrd();
	InitHashKeys();
	InitSq120To64();
	InitBoardVars();
	InitmostLeastValue();
	InitBoardSquares();
}
