////////////////////////////////////////////////////////////////////////////////
/// @brief tests for query language, graph functions
///
/// @file
///
/// DISCLAIMER
///
/// Copyright 2010-2012 triagens GmbH, Cologne, Germany
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
/// http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///
/// Copyright holder is triAGENS GmbH, Cologne, Germany
///
/// @author Florian Bartels
/// @author Copyright 2014, triAGENS GmbH, Cologne, Germany
////////////////////////////////////////////////////////////////////////////////

var jsunity = require("jsunity");
var db = require("org/arangodb").db;
var graph = require("org/arangodb/general-graph");
var errors = require("internal").errors;
var helper = require("org/arangodb/aql-helper");
var getQueryResults = helper.getQueryResults;
var assertQueryError = helper.assertQueryError;

////////////////////////////////////////////////////////////////////////////////
/// @brief test suite for EDGES() function
////////////////////////////////////////////////////////////////////////////////

function ahuacatlQueryGeneralEdgesTestSuite() {
  var vertex = null;
  var edge = null;

  return {

////////////////////////////////////////////////////////////////////////////////
/// @brief set up
////////////////////////////////////////////////////////////////////////////////

    setUp: function () {
      db._drop("UnitTestsAhuacatlVertex1");
      db._drop("UnitTestsAhuacatlVertex2");
      db._drop("UnitTestsAhuacatlVertex3");
      db._drop("UnitTestsAhuacatlVertex4");
      db._drop("UnitTestsAhuacatlEdge1");
      db._drop("UnitTestsAhuacatlEdge2");

      vertex1 = db._create("UnitTestsAhuacatlVertex1");
      vertex2 = db._create("UnitTestsAhuacatlVertex2");
      vertex3 = db._create("UnitTestsAhuacatlVertex3");
      vertex4 = db._create("UnitTestsAhuacatlVertex4");
      edge1 = db._createEdgeCollection("UnitTestsAhuacatlEdge1");
      edge2 = db._createEdgeCollection("UnitTestsAhuacatlEdge2");

      vertex1.save({ _key: "v1" });
      vertex1.save({ _key: "v2" });
      vertex2.save({ _key: "v3" });
      vertex2.save({ _key: "v4" });
      vertex3.save({ _key: "v5" });
      vertex3.save({ _key: "v6" });
      vertex4.save({ _key: "v7" });

      function makeEdge(from, to, collection) {
        collection.save(from, to, { what: from.split("/")[1] + "->" + to.split("/")[1] });
      }

      makeEdge("UnitTestsAhuacatlVertex1/v1", "UnitTestsAhuacatlVertex1/v2", edge1);
      makeEdge("UnitTestsAhuacatlVertex1/v2", "UnitTestsAhuacatlVertex1/v1", edge1);
      makeEdge("UnitTestsAhuacatlVertex1/v1", "UnitTestsAhuacatlVertex3/v5", edge2);
      makeEdge("UnitTestsAhuacatlVertex1/v2", "UnitTestsAhuacatlVertex3/v5", edge2);
      makeEdge("UnitTestsAhuacatlVertex2/v3", "UnitTestsAhuacatlVertex3/v6", edge2);
      makeEdge("UnitTestsAhuacatlVertex2/v4", "UnitTestsAhuacatlVertex4/v7", edge2);
      makeEdge("UnitTestsAhuacatlVertex2/v3", "UnitTestsAhuacatlVertex3/v5", edge2);

      try {
        db._collection("_graphs").remove("_graphs/bla3")
      } catch (err) {
      }
      graph._create(
        "bla3",
        graph.edgeDefinitions(
          graph._undirectedRelationDefinition("UnitTestsAhuacatlEdge1", "UnitTestsAhuacatlVertex1"),
          graph._directedRelationDefinition("UnitTestsAhuacatlEdge2",
            ["UnitTestsAhuacatlVertex1", "UnitTestsAhuacatlVertex2"],
            ["UnitTestsAhuacatlVertex3", "UnitTestsAhuacatlVertex4"]
          )
        )
      );
    },

////////////////////////////////////////////////////////////////////////////////
/// @brief tear down
////////////////////////////////////////////////////////////////////////////////

    tearDown: function () {
      db._drop("UnitTestsAhuacatlVertex1");
      db._drop("UnitTestsAhuacatlVertex2");
      db._drop("UnitTestsAhuacatlVertex3");
      db._drop("UnitTestsAhuacatlVertex4");
      db._drop("UnitTestsAhuacatlEdge1");
      db._drop("UnitTestsAhuacatlEdge2");
      db._collection("_graphs").remove("_graphs/bla3");
    },

////////////////////////////////////////////////////////////////////////////////
/// @brief checks EDGES()
////////////////////////////////////////////////////////////////////////////////

    //graphname,
    //startvertex,
    //direction,
    //edgeexamples,
    //collectionRestrictions


    testEdgesAny: function () {
      var actual;

      actual = getQueryResults("FOR e IN GRAPH_EDGES('bla3', 'UnitTestsAhuacatlVertex1/v1', 'any') SORT e.what RETURN e.what");
      assertEqual(actual, [ "v1->v2", "v1->v5", "v2->v1" ]);

      actual = getQueryResults("FOR e IN GRAPH_EDGES('bla3', 'UnitTestsAhuacatlVertex1/v1', 'any' , [] , ['UnitTestsAhuacatlEdge1']) SORT e.what RETURN e.what");
      assertEqual(actual, [ "v1->v2", "v2->v1" ]);

      actual = getQueryResults("FOR e IN GRAPH_EDGES('bla3', 'UnitTestsAhuacatlVertex1/v1', 'any' , [{'what' : 'v2->v1'}]) SORT e.what RETURN e.what");
      assertEqual(actual, [ "v2->v1" ]);

    },

////////////////////////////////////////////////////////////////////////////////
/// @brief checks EDGES()
////////////////////////////////////////////////////////////////////////////////

    testEdgesIn: function () {
      var actual;

      actual = getQueryResults("FOR e IN GRAPH_EDGES('bla3', 'UnitTestsAhuacatlVertex3/v5', 'inbound') SORT e.what RETURN e.what");
      assertEqual(actual, [ "v1->v5", "v2->v5", "v3->v5"]);

      actual = getQueryResults("FOR e IN GRAPH_EDGES('bla3', 'UnitTestsAhuacatlVertex3/v5', 'inbound' , null , 'UnitTestsAhuacatlEdge2') SORT e.what RETURN e.what");
      assertEqual(actual, [ "v1->v5", "v2->v5", "v3->v5"]);

      actual = getQueryResults("FOR e IN GRAPH_EDGES('bla3', 'UnitTestsAhuacatlVertex3/v5', 'inbound' , [{'what' : 'v2->v5'}]) SORT e.what RETURN e.what");
      assertEqual(actual, [ "v2->v5" ]);
    },


////////////////////////////////////////////////////////////////////////////////
/// @brief checks EDGES()
////////////////////////////////////////////////////////////////////////////////

    testEdgesOut: function () {
      var actual;

      actual = getQueryResults("FOR e IN GRAPH_EDGES('bla3', 'UnitTestsAhuacatlVertex1/v1', 'outbound') SORT e.what RETURN e.what");
      assertEqual(actual, [ "v1->v2", "v1->v5"]);

      actual = getQueryResults("FOR e IN GRAPH_EDGES('bla3', 'UnitTestsAhuacatlVertex1/v1', 'outbound' , null , 'UnitTestsAhuacatlEdge2') SORT e.what RETURN e.what");
      assertEqual(actual, [ "v1->v5"]);

      actual = getQueryResults("FOR e IN GRAPH_EDGES('bla3', 'UnitTestsAhuacatlVertex1/v1', 'outbound' , [{'what' : 'v2->v5'}]) SORT e.what RETURN e.what");
      assertEqual(actual, []);
    },

////////////////////////////////////////////////////////////////////////////////
/// @brief checks EDGES() exceptions
////////////////////////////////////////////////////////////////////////////////

    testEdgesExceptions: function () {
      var actual;

      try {
        getQueryResults("FOR e IN GRAPH_EDGES('notExistingGraph', 'UnitTestsAhuacatlVertex1/v1', 'outbound') SORT e.what RETURN e.what");
      } catch (err) {
        actual = err
      }
      assertEqual(actual, {"error":true,"errorNum":1901,"errorMessage":"invalid graph"});

      try {
        getQueryResults("FOR e IN GRAPH_EDGES('bla3', 'NotExistingVertex', 'outbound') SORT e.what RETURN e.what");
      } catch (err) {
        actual = err
      }
      assertEqual(actual, {"error":true,"errorNum":1202,"errorMessage":"document not found"});


      try {
        getQueryResults("FOR e IN GRAPH_EDGES('bla3', 'UnitTestsAhuacatlVertex1/v1', 'noDirection') SORT e.what RETURN e.what");
      } catch (err) {
        actual = err
      }
      assertEqual(actual, {"error":true,"errorNum":1542,"errorMessage":"invalid argument type used in call to function 'EDGES()'"});

    }

  }
}


////////////////////////////////////////////////////////////////////////////////
/// @brief executes the test suite
////////////////////////////////////////////////////////////////////////////////

jsunity.run(ahuacatlQueryGeneralEdgesTestSuite);

return jsunity.done();

// Local Variables:
// mode: outline-minor
// outline-regexp: "^\\(/// @brief\\|/// @addtogroup\\|// --SECTION--\\|/// @page\\|/// @}\\)"
// End:
