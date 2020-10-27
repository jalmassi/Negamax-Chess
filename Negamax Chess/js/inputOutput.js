function PrSq(sq) {
	return (FileChar[FilesBrd[sq]] + RankChar[RanksBrd[sq]]);
}

function promotePce(move) {
	var MvStr;

	var fFrom = FilesBrd[fromSq(move)];
	var rFrom = RanksBrd[fromSq(move)];
	var fTo = FilesBrd[toSq(move)];
	var rTo = RanksBrd[toSq(move)];

	MvStr = FileChar[fFrom] + RankChar[rFrom] + " " + FileChar[fTo] + RankChar[rTo];

	var promoted = promotedP(move);

	if(promoted) {
		var pchar = 'q';
		if(pieceKnight(promoted)) {
			pchar = 'n';
		} else if(pieceRookQueen(promoted) && !pieceBishopQueen(promoted))  {
			pchar = 'r';
		} else if(!pieceRookQueen(promoted) && pieceBishopQueen(promoted))   {
			pchar = 'b';
		}
		MvStr += pchar;
	}
	return MvStr;
}

function PrintMoveList() {

	var index;
	var move;
	var num = 1;
	console.log('MoveList:');

	for(index = game.moveListStart[game.ply]; index < game.moveListStart[game.ply+1]; ++index) {
		move = game.moveList[index];
		console.log('IMove:' + num + ':(' + index + '):' + promotePce(move) + ' Score:' +  game.moveScores[index]);
		num++;
	}
	console.log('End MoveList');
}

function ParseMove(from, to) {

	GenerateMoves();

	var move = NOMOVE;
	var PromPce = PIECES.EMPTY;
	var found = BOOL.FALSE;

	for(index = game.moveListStart[game.ply];
		index < game.moveListStart[game.ply + 1]; ++index) {
		move = game.moveList[index];
		if(fromSq(move) == from && toSq(move) == to) {
			PromPce = promotedP(move);
			if(PromPce != PIECES.EMPTY) {
				if( (PromPce == PIECES.wQ && game.side == COLOURS.WHITE) ||
					(PromPce == PIECES.bQ && game.side == COLOURS.BLACK) ) {
					found = BOOL.TRUE;
					break;
				}
				continue;
			}
			found = BOOL.TRUE;
			break;
		}
	}

	if(found != BOOL.FALSE) {
		if(!MakeMove(move)) {
			return NOMOVE;
		}
		TakeMove();
		return move;
	}

	return NOMOVE;
}
