import { useGraphStore } from '@/store/useGraphStore';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react'

const BranchShift = ({ nodeid }) => {


    const [bulkAction, setBulkAction] = useState('yes');

    const handleBranchShift = useGraphStore((state) => state.handleBranchShift)


    const handleBranchClick = (branchType) => {
        console.log("The request came to change the branch " , nodeid)
        setBulkAction(branchType);
        handleBranchShift(nodeid);
    }



    return (
        <div>

            {/* Bulk Actions */}
            <div className="space-y-3">
                <div className="text-sm text-gray-700">
                    Move All Bottom Actions
                </div>
                <div className="flex space-x-2">
                    <Button
                        onClick={() => handleBranchClick('yes')}
                        variant={bulkAction === 'yes' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                    >
                        Move to Yes
                    </Button>
                    <Button
                        onClick={() => handleBranchClick('no')}
                        variant={bulkAction === 'no' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                    >
                        Move to No
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default BranchShift