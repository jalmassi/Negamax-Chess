var searchC = {};

searchC.nodes;
searchC.fh; //how often in total it breaks
searchC.fhf;//how often it breaks at first node
searchC.depth;
searchC.time;
searchC.start;
searchC.stop;
searchC.best;
searchC.thinking;

function PickNextMove(moveNum) {

	var index = 0;
	var bestScore = -1;
	var bestNum = moveNum;

	for(index = moveNum; index < game.moveListStart[game.ply+1]; ++index) {
		if(game.moveScores[index] > bestScore) { //finds index with best score
			bestScore = game.moveScores[index];
			bestNum = index;
		}
	}

	if(bestNum != moveNum) {

		swapScores(moveNum, bestNum);

		swapMoves(moveNum, bestNum);
	}

}

function swapScores(moveNum, bestNum){
	var tempScore = 0;
	tempScore = game.moveScores[moveNum]; //swap scores
	game.moveScores[moveNum] = game.moveScores[bestNum];
	game.moveScores[bestNum] = tempScore;

}
function swapMoves(moveNum, bestNum){
	var tempMove = 0;
	tempMove = game.moveList[moveNum];
	game.moveList[moveNum] = game.moveList[bestNum];
	game.moveList[bestNum] = tempMove;
}

function clearMovePosKey() {

	for(index = 0; index < PVENTRIES; index++) {
			game.movePosKey[index].move = NOMOVE;
			game.movePosKey[index].posKey = 0;
	}
}

function CheckUp() { //stop searching if taking too long
	if (( $.now() - searchC.start ) > searchC.time) {
		searchC.stop = BOOL.TRUE;
	}
}
//purpose: for memoization -> if previous position is same in history, we can skip calculations
function IsRepetition() {
	var index = 0;

	for(index = game.hisPly - game.fiftyMove; index < game.hisPly - 1; ++index) { //get up to 2 half-moves ago
		if(game.posKey == game.history[index].posKey) {
			return BOOL.TRUE;
		}
	}

	return BOOL.FALSE;
}

function alphaBetaCapture(alpha, beta) { //alphabeta fn but only on captures

	if (!(searchC.nodes % 2048)) {
		CheckUp();	//every 2048ms, check time
	}

	searchC.nodes++;
	//ply>0 because don't want exit search on first move
	//checks if returning to same position in history or 50 move rule hit
	if( (IsRepetition() || game.fiftyMove >= 100) && game.ply) {
		return 0;
	}

	if(game.ply > MAXDEPTH -1) {
		return EvalPosition();
	}

	var score = EvalPosition();

	if(beta <= score) {
		return beta;
	}

	if(score > alpha) {
		alpha = score;
	}

	GenerateCaptures();

	var moveNum = 0;
	var legal = 0;
	var prevAlpha = alpha;
	var bestMove = NOMOVE;
	var Move = NOMOVE;

	for(moveNum = game.moveListStart[game.ply]; moveNum < game.moveListStart[game.ply + 1]; ++moveNum) {

		PickNextMove(moveNum); //get best moves first

		Move = game.moveList[moveNum];

		if(!MakeMove(Move)) {
			continue;
		}
		legal++;
		score = -alphaBetaCapture( -beta, -alpha);

		TakeMove();

		if(searchC.stop) {
			return 0;
		}

		if(score > alpha) {
			if(score >= beta) {
				if(legal == 1) {
					searchC.fhf++;
				}
				searchC.fh++;
				return beta;
			}
			alpha = score;
			bestMove = Move;
		}
	}
	//if better alpha found
	if(alpha != prevAlpha) {
		StorePvMove(bestMove);
	}

	return alpha;

}

function AlphaBeta(alpha, beta, depth) {


	if(depth <= 0) {
		return alphaBetaCapture(alpha, beta);
	}

	if (!(searchC.nodes % 2048)) {
		CheckUp(); //every 2048 nodes, check time
	}

	searchC.nodes++;

	if( (IsRepetition() || game.fiftyMove >= 100) && game.ply) {	//checking if drawn
		return 0;
	}

	if(game.ply > MAXDEPTH -1) {
		return EvalPosition();
	}

	var InCheck = SqAttacked(game.pList[pieceIndex(Kings[game.side],0)], game.side^1);
	if(InCheck)  {
		depth++;
	}

	var score = -INFINITE;

	GenerateMoves();

	var moveNum = 0;
	var legal = 0;
	var prevAlpha = alpha;
	var bestMove = NOMOVE;
	var Move = NOMOVE;

	var PvMove = getMoveFromPvT();
	if(PvMove != NOMOVE) {
		for(moveNum = game.moveListStart[game.ply]; moveNum < game.moveListStart[game.ply + 1]; ++moveNum) {
			if(game.moveList[moveNum] == PvMove) {
				game.moveScores[moveNum] = 2000000;
				break;
			}
		}
	}

	for(moveNum = game.moveListStart[game.ply]; moveNum < game.moveListStart[game.ply + 1]; ++moveNum) {

		PickNextMove(moveNum); //get best moves first

		Move = game.moveList[moveNum];

		if(!MakeMove(Move)) {
			continue;
		}
		legal++;
		score = -AlphaBeta( -beta, -alpha, depth-1);

		TakeMove();

		if(searchC.stop) {
			return 0;
		}

		if(score > alpha) {
			if(beta <= score) {
				if(legal == 1) { //if first move in tree
					searchC.fhf++;
				}
				searchC.fh++;
				if(!(Move & MFLAGCAP)) { //if nothing captured
					game.killerMoves[MAXDEPTH + game.ply] =
						game.killerMoves[game.ply];
					game.killerMoves[game.ply] = Move;
				}
				return beta;
			}
			if(!(Move & MFLAGCAP)) {
				game.searchHistory[game.pieces[fromSq(Move)] * BRD_SQ_NUM + toSq(Move)]
						 += depth * depth;
			}
			alpha = score;
			bestMove = Move;
		}
	}

	if(legal == 0) {
		if(InCheck) {
			return -MATE + game.ply;
		} else {
			return 0;
		}
	}
	//if better alpha found
	if(alpha != prevAlpha) {
		StorePvMove(bestMove);
	}

	return alpha;
}

function ClearForSearch() {

	var index = 0;

	for(index = 0; index < 14 * BRD_SQ_NUM; ++index) {
		game.searchHistory[index] = 0;
	}

	for(index = 0; index < 3 * MAXDEPTH; ++index) {
		game.killerMoves[index] = 0;
	}

	clearMovePosKey();
	game.ply = 0;
	searchC.nodes = 0;
	searchC.fh = 0;
	searchC.fhf = 0;
	searchC.start = $.now();
	searchC.stop = BOOL.FALSE;
}

function SearchPosition() {

	var bestMove = NOMOVE;
	var bestScore = -INFINITE;
	var score = -INFINITE;
	var currentDepth = 0;
	var line;
	var PvNum;
	var c;

	ClearForSearch();

	for( currentDepth = 1; currentDepth <= searchC.depth; ++currentDepth) {

		score = AlphaBeta(-INFINITE, INFINITE, currentDepth);

		if(searchC.stop) {
			break;
		}

		bestScore = score;
		bestMove = getMoveFromPvT();
		line = 'D:' + currentDepth + ' Best:' + promotePce(bestMove) + ' Score:' + bestScore +
				' nodes:' + searchC.nodes;

		PvNum = GetPvLine(currentDepth);
		line += ' Pv:';
		for( c = 0; c < PvNum; ++c) {
			line += ' ' + promotePce(game.PvArray[c]);
		}
		if(currentDepth!=1) {
			line += (" Ordering:" + ((searchC.fhf/searchC.fh)*100).toFixed(2) + "%");
		}
		console.log(line);

	}

	searchC.best = bestMove;
	searchC.thinking = BOOL.FALSE;
	UpdateDOMStats(bestScore, currentDepth);
}

function UpdateDOMStats(dom_score, dom_depth) {

	var scoreText = "Score: " + (dom_score / 100).toFixed(2);
	if(Math.abs(dom_score) > MATE - MAXDEPTH) {
		scoreText = "Score: Mate In " + (MATE - (Math.abs(dom_score))-1) + " moves";
	}

	$("#OrderingOut").text("Ordering: " + ((searchC.fhf/searchC.fh)*100).toFixed(2) + "%");
	$("#DepthOut").text("Depth: " + dom_depth);
	$("#ScoreOut").text(scoreText);
	$("#NodesOut").text("Nodes: " + searchC.nodes);
	$("#TimeOut").text("Time: " + (($.now()-searchC.start)/1000).toFixed(1) + "s");
	$("#BestOut").text("bestMove: " + promotePce(searchC.best));
}
