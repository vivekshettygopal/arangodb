////////////////////////////////////////////////////////////////////////////////
/// @brief abstract base class for jobs
///
/// @file
///
/// DISCLAIMER
///
/// Copyright 2010-2011 triagens GmbH, Cologne, Germany
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///
/// Copyright holder is triAGENS GmbH, Cologne, Germany
///
/// @author Dr. Frank Celler
/// @author Martin Schoenert
/// @author Copyright 2009-2011, triAGENS GmbH, Cologne, Germany
////////////////////////////////////////////////////////////////////////////////

#ifndef TRIAGENS_FYN_REST_JOB_H
#define TRIAGENS_FYN_REST_JOB_H 1

#include <Basics/Common.h>

namespace triagens {
  namespace basics {
    class TriagensError;
  }

  namespace rest {
    class DispatcherThread;

    ////////////////////////////////////////////////////////////////////////////////
    /// @ingroup Dispatcher
    /// @brief abstract base class for jobs
    ////////////////////////////////////////////////////////////////////////////////

    class Job {
      private:
        Job (Job const&);
        Job& operator= (Job const&);

      public:

        ////////////////////////////////////////////////////////////////////////////////
        /// @brief job types
        ////////////////////////////////////////////////////////////////////////////////

        enum JobType {
          READ_JOB,
          WRITE_JOB,
          SPECIAL_JOB
        };

        ////////////////////////////////////////////////////////////////////////////////
        /// @brief status of execution
        ////////////////////////////////////////////////////////////////////////////////

        enum status_e {
          JOB_DONE,
          JOB_REQUEUE,
          JOB_FAILED
        };

      public:

        ////////////////////////////////////////////////////////////////////////////////
        /// @brief constructs a job
        ////////////////////////////////////////////////////////////////////////////////

        explicit
        Job (string const& name)
          : name(name) {
        }

        ////////////////////////////////////////////////////////////////////////////////
        /// @brief deletes the job
        ////////////////////////////////////////////////////////////////////////////////

        virtual ~Job () {
        }

      public:

        ////////////////////////////////////////////////////////////////////////////////
        /// @brief gets the type of the job
        ///
        /// Note that initialise can change the job type.
        ////////////////////////////////////////////////////////////////////////////////

        virtual JobType type () = 0;

        ////////////////////////////////////////////////////////////////////////////////
        /// @brief returns the queue name to use
        ////////////////////////////////////////////////////////////////////////////////

        virtual string const& queue () {
          static string standard = "STANDARD";
          return standard;
        }

        ////////////////////////////////////////////////////////////////////////////////
        /// @brief sets the thread which currently dealing with the job
        ////////////////////////////////////////////////////////////////////////////////

        virtual void setDispatcherThread (DispatcherThread*);

        ////////////////////////////////////////////////////////////////////////////////
        /// @brief starts working
        ////////////////////////////////////////////////////////////////////////////////

        virtual status_e work () = 0;

        ////////////////////////////////////////////////////////////////////////////////
        /// @brief cleans up after work and delete
        ////////////////////////////////////////////////////////////////////////////////

        virtual void cleanup () = 0;

        ////////////////////////////////////////////////////////////////////////////////
        /// @brief handle error and delete
        ////////////////////////////////////////////////////////////////////////////////

        virtual void handleError (basics::TriagensError const&) = 0;
        
        ////////////////////////////////////////////////////////////////////////////////
        /// @brief shut downs the execution and deletes everything
        ////////////////////////////////////////////////////////////////////////////////

        virtual bool beginShutdown () = 0;

      public:

        ////////////////////////////////////////////////////////////////////////////////
        /// @brief getter for the name
        ////////////////////////////////////////////////////////////////////////////////

        const string& getName () const {
          return name;
        }

      private:
        const string& name;
    };
  }
}

#endif
