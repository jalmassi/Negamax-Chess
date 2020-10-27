function GetPvLine(depth) {

	var move = getMoveFromPvT();
	var count = 0;

	while(move != NOMOVE && count < depth) {

		if( MoveExists(move)) {
			MakeMove(move);
			game.PvArray[count++] = move;
		} else {
			break;
		}
		move = getMoveFromPvT();
	}

	while(game.ply > 0) {
		TakeMove();
	}

	return count;

}

function getMoveFromPvT() {
	var index = game.posKey % PVENTRIES;

	if(game.movePosKey[index].posKey == game.posKey) {
		return game.movePosKey[index].move;
	}

	return NOMOVE;
}

function StorePvMove(move) {
	var index = game.posKey % PVENTRIES;
	game.movePosKey[index].posKey = game.posKey;
	game.movePosKey[index].move = move;
}