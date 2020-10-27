var BishopPair = 40;

function EvalPosition() {

	var score = game.material[COLOURS.WHITE] - game.material[COLOURS.BLACK];

	var pce;
	var sq;
	var pceNum;

	pce = PIECES.wP;
	for(pceNum = 0; pceNum < game.pceNum[pce]; ++pceNum) {
		sq = game.pList[pieceIndex(pce,pceNum)];
		score += PawnTable[sq64(sq)];
	}

	pce = PIECES.bP;
	for(pceNum = 0; pceNum < game.pceNum[pce]; ++pceNum) {
		sq = game.pList[pieceIndex(pce,pceNum)];
		score -= PawnTable[mirror(sq64(sq))];
	}

	pce = PIECES.wN;
	for(pceNum = 0; pceNum < game.pceNum[pce]; ++pceNum) {
		sq = game.pList[pieceIndex(pce,pceNum)];
		score += KnightTable[sq64(sq)];
	}

	pce = PIECES.bN;
	for(pceNum = 0; pceNum < game.pceNum[pce]; ++pceNum) {
		sq = game.pList[pieceIndex(pce,pceNum)];
		score -= KnightTable[mirror(sq64(sq))];
	}

	pce = PIECES.wB;
	for(pceNum = 0; pceNum < game.pceNum[pce]; ++pceNum) {
		sq = game.pList[pieceIndex(pce,pceNum)];
		score += BishopTable[sq64(sq)];
	}

	pce = PIECES.bB;
	for(pceNum = 0; pceNum < game.pceNum[pce]; ++pceNum) {
		sq = game.pList[pieceIndex(pce,pceNum)];
		score -= BishopTable[mirror(sq64(sq))];
	}

	pce = PIECES.wR;
	for(pceNum = 0; pceNum < game.pceNum[pce]; ++pceNum) {
		sq = game.pList[pieceIndex(pce,pceNum)];
		score += RookTable[sq64(sq)];
	}

	pce = PIECES.bR;
	for(pceNum = 0; pceNum < game.pceNum[pce]; ++pceNum) {
		sq = game.pList[pieceIndex(pce,pceNum)];
		score -= RookTable[mirror(sq64(sq))];
	}

	pce = PIECES.wQ;
	for(pceNum = 0; pceNum < game.pceNum[pce]; ++pceNum) {
		sq = game.pList[pieceIndex(pce,pceNum)];
		score += RookTable[sq64(sq)];
	}

	pce = PIECES.bQ;
	for(pceNum = 0; pceNum < game.pceNum[pce]; ++pceNum) {
		sq = game.pList[pieceIndex(pce,pceNum)];
		score -= RookTable[mirror(sq64(sq))];
	}

	if(game.pceNum[PIECES.wB] >= 2) {
		score += BishopPair;
	}

	if(game.pceNum[PIECES.bB] >= 2) {
		score -= BishopPair;
	}

	if(game.side == COLOURS.WHITE) {
		return score;
	} else {
		return -score;
	}

}
